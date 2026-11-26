/**
 * BBVision - Tela de Câmera com IA Verificando Imagem
 * Captura exclusiva in-loco com Visão Computacional IA (SLA <= 15s, confiança >= 75%)
 * - Galeria bloqueada (inviolabilidade)
 * - Data/hora e GPS em tempo real carimbados no canvas antes do envio
 * - Selfie/pessoas permitidas nas laterais; centro reservado à obra/prédio/casa/construção
 * - Fallback real para Validação Manual (com hash SHA-256 local) em caso de timeout ou modo offline
 * - Cleanup automático de hardware (câmera, relógio e GPS) ao sair da tela
 */

import { Icons } from '../assets/icons.js';
import { state } from '../services/state.js';
import { api } from '../services/api.js';
import { toast } from '../components/toast.js';
import { renderBackButton } from '../components/backButton.js';
import { escapeHtml, computeSha256FromDataUrl } from '../utils/formatters.js';

export function renderCameraIa() {
  const vistoria = state.currentVistoria;
  if (vistoria.statusIA === 'REJEITADO') {
    vistoria.fotoCamera = null;
  }

  const fotoValidaExistente = Boolean(
    vistoria.fotoCamera && (vistoria.statusIA === 'APROVADO' || vistoria.validacaoManual || vistoria.statusIA === 'VALIDACAO_MANUAL')
  );
  const isManualExistente = Boolean(vistoria.validacaoManual || vistoria.statusIA === 'VALIDACAO_MANUAL');
  const confiancaPct = vistoria.confiancaIA ? Math.round(vistoria.confiancaIA * 100) : null;

  const agora = new Date();
  const dataHoje = vistoria.dataFoto || agora.toLocaleDateString('pt-BR');
  const horaAgora = vistoria.horaFoto || agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const localAtual = vistoria.localizacaoFoto || 'Obtendo GPS em tempo real...';

  return `
    <div class="page-container fade-in camera-screen-wrapper" id="cameraIaPage">
      <div class="camera-fullview">
        <div class="camera-topbar-overlay">
          ${renderBackButton({
            id: 'btnVoltarTipoLocal',
            label: 'Voltar',
            variant: 'camera',
            title: 'Voltar para o Checklist de Verificação',
          })}

          <div class="cam-status-pill">
            <span class="ai-status-pulse" id="aiStatusPulse" style="${
              fotoValidaExistente ? `background: ${isManualExistente ? '#F59E0B' : '#10B981'};` : ''
            }"></span>
            <span id="aiStatusBadgeText">${
              fotoValidaExistente
                ? isManualExistente
                  ? 'Foto em Validação Manual'
                  : 'IA: Obra Validada'
                : 'Câmera Ativa • IA Pronta'
            }</span>
          </div>

          <div style="display: flex; gap: 6px;">
            <button class="cam-top-btn" id="btnAlternarCamera" title="Alternar Câmera (Traseira / Selfie)" style="display:inline-flex; align-items:center; justify-content:center;">
              ${Icons.cameraFlip(20)}
            </button>
          </div>
        </div>

        <div class="camera-lens-container" id="cameraLensContainer">
          <video id="liveVideoFeed" autoplay playsinline muted class="camera-live-video ${fotoValidaExistente ? 'hidden' : ''}"></video>
          <canvas id="liveCaptureCanvas" class="hidden"></canvas>

          <img
            src="${fotoValidaExistente ? escapeHtml(vistoria.fotoCamera) : ''}"
            alt="Visor da Câmera"
            class="camera-stream-img ${fotoValidaExistente ? '' : 'hidden'}"
            id="cameraMainStream"
          />

          <div class="camera-focus-reticle" id="cameraReticle">
            <div class="reticle-corner top-left"></div>
            <div class="reticle-corner top-right"></div>
            <div class="reticle-corner bottom-left"></div>
            <div class="reticle-corner bottom-right"></div>
            <div class="reticle-center-cross"></div>
          </div>

          <div class="ai-scanner-overlay hidden" id="aiScannerOverlay">
            <div class="ai-laser-bar"></div>
            <div class="ai-scanning-info">
              <span class="scanning-title">IA VERIFICANDO CONDIÇÕES DA FOTO...</span>
              <span class="scanning-sub">SLA ≤ 15s • Iluminação, Obra/Prédio/Casa/Construção e Centro Livre</span>
            </div>
          </div>

          <div class="ai-warning-box hidden" id="aiWarningBox">
            <span class="warning-msg" id="aiWarningMsg">Foto reprovada pela IA. Reenquadre o local da obra.</span>
          </div>

          <div class="hidden" id="cameraUnavailableOverlay" style="position:absolute; inset:0; z-index:25; background:rgba(0, 27, 61, 0.92); display:none; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:24px; color:#FFFFFF; gap:12px;">
            <div style="width:52px; height:52px; border-radius:50%; background:rgba(254, 211, 4, 0.14); border:1.5px solid #FED304; display:flex; align-items:center; justify-content:center; color:#FED304;">
              ${Icons.cameraAiLens(24)}
            </div>
            <strong style="font-size:16px; color:#FED304;">Câmera do Dispositivo Obrigatória</strong>
            <p id="cameraUnavailableMsg" style="font-size:13px; color:#E2E8F0; max-width:340px; line-height:1.5; margin:0;">
              Para validar a obra com a IA, é obrigatório autorizar e usar a câmera real do seu dispositivo (não são permitidas imagens da galeria).
            </p>
            <button type="button" id="btnReativarCamera" style="margin-top:4px; background:#FED304; color:#002D62; border:none; border-radius:10px; padding:10px 18px; font-weight:800; font-size:13.5px; cursor:pointer;">
              Ativar Câmera do Dispositivo
            </button>
          </div>

          <div class="camera-meta-overlay" id="cameraMetaOverlay">
            <div class="meta-line">
              <strong>Data:</strong> <span id="metaDataFoto">${escapeHtml(dataHoje)}</span> &nbsp;
              <strong>Hora:</strong> <span id="metaHoraFoto">${escapeHtml(horaAgora)}</span>
            </div>
            <div class="meta-line">
              <strong>Localização:</strong> <span id="metaLocalFoto">${escapeHtml(localAtual)}</span>
            </div>
            <div class="meta-line" style="font-family: monospace; font-size: 10px; opacity: 0.9;">
              <strong>SHA-256:</strong> <span id="metaHashFoto">${
                vistoria.hashSha256 ? escapeHtml(vistoria.hashSha256.substring(0, 28) + '...') : 'Pendente de disparo'
              }</span>
            </div>
          </div>
        </div>

        <div class="camera-bottom-controls">
          <div class="controls-aux-bar" style="flex-wrap: wrap; gap: 6px;">
            <span class="cam-step-hint" id="camStepHint">
              ${
                fotoValidaExistente
                  ? isManualExistente
                    ? 'Evidência registrada em validação manual.'
                    : 'Evidência validada pela IA.'
                  : 'Enquadre a obra no centro do visor'
              }
            </span>
            <span class="cam-security-note" style="display:inline-flex; align-items:center; gap:5px;">${Icons.lockInviolavel(13)} Somente câmera ao vivo</span>
          </div>

          <div class="cam-verified-banner ${fotoValidaExistente ? '' : 'hidden'}" id="camVerifiedBanner" style="${
            isManualExistente ? 'background: rgba(245, 158, 11, 0.16); border-color: #F59E0B;' : ''
          }">
            <span class="verified-icon-check" id="verifiedBannerIcon" style="${
              isManualExistente ? 'background: #F59E0B; color: #FFFFFF;' : ''
            }">${isManualExistente ? '!' : '✓'}</span>
            <div class="verified-banner-texts">
              <strong id="lblVerifiedText">${
                isManualExistente ? 'Foto Capturada (Validação Manual Assistida)' : 'Foto Capturada e Validada'
              }</strong>
              <span id="lblVerifiedSub">${
                isManualExistente
                  ? 'Sujeita à auditoria humana pelo Fiscal de Obra'
                  : confiancaPct
                  ? `IA ${confiancaPct}% • Obra/construção e centro livre aprovados`
                  : 'Obra/construção e centro livre aprovados'
              }</span>
            </div>
          </div>

          <div class="camera-action-row" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <button class="btn-capture-main ${fotoValidaExistente ? 'hidden' : ''}" id="btnDispararAvaliacao" type="button" title="Capturar Foto da Obra">
              <span class="capture-btn-icon" style="display:inline-flex; align-items:center;">${Icons.cameraAiLens(24)}</span>
              <span>Capturar Foto da Obra e Validar com IA</span>
            </button>

            <div class="camera-post-capture-actions ${fotoValidaExistente ? '' : 'hidden'}" id="postCaptureActions" style="display: flex; gap: 10px; width: 100%;">
              <button class="btn-retake-clear" id="btnRetakePhoto" type="button" style="flex: 1;">
                Tirar Outra Foto
              </button>
              <button class="btn-confirm-photo-advance" id="btnAvancarVerificado" type="button" style="flex: 1.6;">
                Confirmar Foto e Avançar →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="vistoria-modal-overlay hidden" id="modalValidacaoManual">
        <div class="vistoria-modal-card">
          <h3>Validação Manual Assistida</h3>
          <p id="lblMotivoValidacaoManual">O serviço de IA excedeu o SLA técnico (15s) ou o dispositivo está sem conexão no momento.</p>
          <p style="font-size: 12px; color: #6B7280; margin-top: 6px;">
            Deseja prosseguir com <strong>Validação Manual</strong>? O relatório receberá o selo de auditoria humana pelo Fiscal de Obra.
          </p>
          <div style="display: flex; gap: 10px; margin-top: 14px;">
            <button class="btn-secondary-white" id="btnCancelarManual" style="flex: 1;">
              Tentar Novamente
            </button>
            <button class="btn-submit-primary" id="btnConfirmarManual" style="flex: 1;">
              Prosseguir Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindCameraIaEvents() {
  const videoFeed = document.getElementById('liveVideoFeed');
  const mainStreamImg = document.getElementById('cameraMainStream');
  const btnAlternarCam = document.getElementById('btnAlternarCamera');
  const btnDisparar = document.getElementById('btnDispararAvaliacao');
  const postCaptureActions = document.getElementById('postCaptureActions');
  const camVerifiedBanner = document.getElementById('camVerifiedBanner');
  const camStepHint = document.getElementById('camStepHint');
  const statusBadge = document.getElementById('aiStatusBadgeText');
  const pulseDot = document.getElementById('aiStatusPulse');
  const lblVerified = document.getElementById('lblVerifiedText');
  const lblSub = document.getElementById('lblVerifiedSub');
  const warningBox = document.getElementById('aiWarningBox');
  const warningMsg = document.getElementById('aiWarningMsg');
  const scannerOverlay = document.getElementById('aiScannerOverlay');
  const modalManual = document.getElementById('modalValidacaoManual');
  const lblMotivoManual = document.getElementById('lblMotivoValidacaoManual');
  const btnRetake = document.getElementById('btnRetakePhoto');
  const btnAvancar = document.getElementById('btnAvancarVerificado');

  const elMetaData = document.getElementById('metaDataFoto');
  const elMetaHora = document.getElementById('metaHoraFoto');
  const elMetaLocal = document.getElementById('metaLocalFoto');
  const elMetaHash = document.getElementById('metaHashFoto');
  const cameraUnavailableOverlay = document.getElementById('cameraUnavailableOverlay');
  const cameraUnavailableMsg = document.getElementById('cameraUnavailableMsg');
  const btnReativarCamera = document.getElementById('btnReativarCamera');

  const fotoValidaExistente = Boolean(
    state.currentVistoria.fotoCamera &&
      (state.currentVistoria.statusIA === 'APROVADO' ||
        state.currentVistoria.validacaoManual ||
        state.currentVistoria.statusIA === 'VALIDACAO_MANUAL')
  );

  let streamAtivo = null;
  let facingModeAtual = 'environment';
  let relogioInterval = null;
  let watchGpsId = null;
  let fotoCongelada = fotoValidaExistente;
  let isDisposed = false;

  function mostrarOverlayCameraIndisponivel(mensagem) {
    if (cameraUnavailableMsg && mensagem) {
      cameraUnavailableMsg.textContent = mensagem;
    }
    if (cameraUnavailableOverlay) {
      cameraUnavailableOverlay.classList.remove('hidden');
      cameraUnavailableOverlay.style.display = 'flex';
    }
    if (btnDisparar) {
      btnDisparar.disabled = true;
      btnDisparar.style.opacity = '0.55';
    }
  }

  function ocultarOverlayCameraIndisponivel() {
    if (cameraUnavailableOverlay) {
      cameraUnavailableOverlay.classList.add('hidden');
      cameraUnavailableOverlay.style.display = 'none';
    }
    if (btnDisparar) {
      btnDisparar.disabled = false;
      btnDisparar.style.opacity = '1';
    }
  }

  function iniciarRelogioTempoReal() {
    function atualizar() {
      if (fotoCongelada || isDisposed) return;
      const agora = new Date();
      const dataStr = agora.toLocaleDateString('pt-BR');
      const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (elMetaData) elMetaData.textContent = dataStr;
      if (elMetaHora) elMetaHora.textContent = horaStr;

      state.currentVistoria.dataFoto = dataStr;
      state.currentVistoria.horaFoto = horaStr;
    }

    atualizar();
    if (relogioInterval) clearInterval(relogioInterval);
    relogioInterval = setInterval(atualizar, 1000);
  }

  async function resolverEnderecoReverso(lat, lng, precisao) {
    if (isDisposed || fotoCongelada) return;
    const coordsStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    let localFinal = `GPS: ${coordsStr} (±${Math.round(precisao)}m)`;

    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3500),
      });
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const rua = addr.road || addr.street || addr.pedestrian || addr.suburb || '';
        const num = addr.house_number ? `, ${addr.house_number}` : '';
        const bairro = addr.suburb || addr.neighbourhood || '';
        const cidade = addr.city || addr.town || addr.village || addr.municipality || '';
        const uf = addr.state_code || addr.state || '';

        let formatado = rua ? `${rua}${num}` : '';
        if (bairro && formatado) formatado += ` - ${bairro}`;
        if (cidade) formatado += `, ${cidade}`;
        if (uf) formatado += `/${uf}`;

        if (formatado) {
          localFinal = `${formatado} (${coordsStr})`;
        }
      }
    } catch (_) {
      // Mantém coordenadas GPS
    }

    if (isDisposed || fotoCongelada) return;
    state.setLocalizacaoFoto(localFinal, { lat, lng, precisao }, false);
    if (elMetaLocal) elMetaLocal.textContent = localFinal;
  }

  function iniciarGpsTempoReal() {
    if (fotoCongelada) return;
    if (!navigator.geolocation) {
      const fallback = state.currentVistoria.endereco
        ? `${state.currentVistoria.endereco} (GPS indisponível)`
        : 'Geolocalização não suportada';
      state.setLocalizacaoFoto(fallback, null, false);
      if (elMetaLocal) elMetaLocal.textContent = fallback;
      return;
    }

    if (elMetaLocal && (!state.currentVistoria.coordenadas || elMetaLocal.textContent.includes('Obtendo'))) {
      elMetaLocal.textContent = 'Obtendo GPS exato em tempo real...';
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        if (isDisposed || fotoCongelada) return;
        const { latitude, longitude, accuracy } = pos.coords;
        resolverEnderecoReverso(latitude, longitude, accuracy);
      },
      err => {
        if (isDisposed || fotoCongelada) return;
        console.warn('[GPS] Erro ao obter posição:', err.message);
        const fallback = state.currentVistoria.endereco
          ? `${state.currentVistoria.endereco} (GPS pendente)`
          : 'GPS pendente de permissão no dispositivo';
        state.setLocalizacaoFoto(fallback, null, false);
        if (elMetaLocal) elMetaLocal.textContent = fallback;
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    try {
      watchGpsId = navigator.geolocation.watchPosition(
        pos => {
          if (fotoCongelada || isDisposed) return;
          const { latitude, longitude, accuracy } = pos.coords;
          state.currentVistoria.coordenadas = { lat: latitude, lng: longitude, precisao: accuracy };
          const coordsStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          if (elMetaLocal && !elMetaLocal.textContent.includes(' - ')) {
            elMetaLocal.textContent = `GPS: ${coordsStr} (±${Math.round(accuracy)}m)`;
          }
        },
        err => console.warn('[GPS Watch] Erro:', err.message),
        { enableHighAccuracy: true, maximumAge: 2000 }
      );
    } catch (_) {}
  }

  function aguardarVideoPronto(videoEl, timeoutMs = 4000) {
    return new Promise(resolve => {
      if (!videoEl) return resolve(false);
      if (videoEl.readyState >= 2 && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        return resolve(true);
      }
      let finalizado = false;
      const concluir = ok => {
        if (finalizado) return;
        finalizado = true;
        videoEl.removeEventListener('loadedmetadata', onReady);
        videoEl.removeEventListener('loadeddata', onReady);
        videoEl.removeEventListener('playing', onReady);
        clearTimeout(timer);
        resolve(ok);
      };
      const onReady = () => {
        if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) concluir(true);
      };
      const timer = setTimeout(() => {
        concluir(videoEl.videoWidth > 0 && videoEl.videoHeight > 0);
      }, timeoutMs);
      videoEl.addEventListener('loadedmetadata', onReady);
      videoEl.addEventListener('loadeddata', onReady);
      videoEl.addEventListener('playing', onReady);
    });
  }

  function pararStream() {
    if (streamAtivo) {
      streamAtivo.getTracks().forEach(t => t.stop());
      streamAtivo = null;
    }
    if (videoFeed && videoFeed.srcObject) {
      videoFeed.srcObject = null;
    }
  }

  function pararCamera() {
    isDisposed = true;
    pararStream();
    if (relogioInterval) {
      clearInterval(relogioInterval);
      relogioInterval = null;
    }
    if (watchGpsId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchGpsId);
      watchGpsId = null;
    }
  }

  async function iniciarCamera() {
    if (isDisposed) return false;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msgSemSuporte = !window.isSecureContext
        ? 'O navegador bloqueia a câmera em conexões HTTP inseguras. Acesse o BBVision via HTTPS ou localhost.'
        : 'Este dispositivo ou navegador não suporta acesso à câmera ao vivo.';
      if (statusBadge) statusBadge.innerText = 'Câmera Indisponível';
      if (pulseDot) pulseDot.style.background = '#EF4444';
      if (videoFeed) videoFeed.classList.add('hidden');
      mostrarOverlayCameraIndisponivel(msgSemSuporte);
      toast.warning('Câmera Necessária', msgSemSuporte);
      return false;
    }

    try {
      pararStream();
      let stream = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingModeAtual }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('[Camera] Tentando fallback para câmera disponível:', firstErr.message);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (isDisposed) {
        stream.getTracks().forEach(t => t.stop());
        return false;
      }

      streamAtivo = stream;
      if (videoFeed) {
        videoFeed.srcObject = streamAtivo;
        videoFeed.classList.remove('hidden');
        if (mainStreamImg) mainStreamImg.classList.add('hidden');
        try {
          await videoFeed.play();
        } catch (e) {
          console.warn('[Camera] videoFeed.play():', e.message);
        }

        const pronto = await aguardarVideoPronto(videoFeed, 4000);
        if (!pronto) {
          throw new Error('A câmera foi aberta, mas ainda não enviou quadros de vídeo.');
        }

        ocultarOverlayCameraIndisponivel();
        if (statusBadge) statusBadge.innerText = 'Câmera Ativa • IA Pronta';
        if (pulseDot) pulseDot.style.background = '#10B981';
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Camera] Câmera física não iniciada:', err.name, err.message);
      pararStream();
      if (statusBadge) statusBadge.innerText = 'Câmera Indisponível';
      if (pulseDot) pulseDot.style.background = '#EF4444';
      if (videoFeed) videoFeed.classList.add('hidden');

      let msgErro = 'Câmera não detectada ou permissão negada. Autorize o acesso à câmera e clique em "Ativar Câmera do Dispositivo".';
      if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        msgErro = 'Permissão da câmera negada. Libere o acesso à câmera no cadeado da barra de endereço do navegador e tente novamente.';
      } else if (err && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError')) {
        msgErro = 'Nenhuma câmera foi encontrada neste dispositivo. Conecte ou habilite a câmera para realizar a vistoria.';
      } else if (err && (err.name === 'NotReadableError' || err.name === 'TrackStartError')) {
        msgErro = 'A câmera está sendo usada por outro aplicativo. Feche-o e clique em "Ativar Câmera do Dispositivo".';
      }

      mostrarOverlayCameraIndisponivel(msgErro);
      toast.warning('Permissão de Câmera', msgErro);
      return false;
    }
  }

  /**
   * Pré-análise visual local no frame bruto (antes da estampa)
   * Verifica baixa luz, pessoa obstruindo o centro e ausência de estrutura arquitetônica.
   */
  async function analisarCondicoesVisuaisIA(canvas, ctx, width, height) {
    let facesDetectadasApi = 0;
    let facesNoCentroApi = 0;

    const cMinX = width * 0.28;
    const cMaxX = width * 0.72;
    const cMinY = height * 0.2;
    const cMaxY = height * 0.78;
    const centerZoneArea = Math.max(1, (cMaxX - cMinX) * (cMaxY - cMinY));

    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
        const faces = await detector.detect(canvas);
        if (Array.isArray(faces) && faces.length > 0) {
          facesDetectadasApi = faces.length;
          for (const face of faces) {
            const box = face.boundingBox;
            if (!box) continue;
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;
            const interW = Math.max(0, Math.min(box.x + box.width, cMaxX) - Math.max(box.x, cMinX));
            const interH = Math.max(0, Math.min(box.y + box.height, cMaxY) - Math.max(box.y, cMinY));
            const faceArea = Math.max(1, box.width * box.height);
            const overlapFaceRatio = (interW * interH) / faceArea;
            const overlapCenterRatio = (interW * interH) / centerZoneArea;

            const centroDentroDaZona = cx >= cMinX && cx <= cMaxX && cy >= cMinY && cy <= cMaxY;
            if (centroDentroDaZona || overlapFaceRatio >= 0.45 || overlapCenterRatio >= 0.22) {
              facesNoCentroApi++;
            }
          }
        }
      } catch (_) {}
    }

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const cols = 8;
    const rows = 6;
    const cellTotal = new Int32Array(cols * rows);
    const cellSkin = new Int32Array(cols * rows);
    const cellDarkFeatures = new Int32Array(cols * rows);
    const cellSumY = new Float64Array(cols * rows);
    const cellSumY2 = new Float64Array(cols * rows);

    let totalSamples = 0;
    let somaY = 0;
    let somaY2 = 0;
    let pixelsEscuros = 0;
    let pixelsMuitoEscuros = 0;
    let pixelsBrilhoUtil = 0;

    let centroTotal = 0;
    let centroPele = 0;
    let centroFeicoesEscuras = 0;
    let centroSomaY = 0;
    let centroSomaY2 = 0;
    let centroSomaGradVertical = 0;
    let centroGradSamples = 0;

    let bordaLateralTotal = 0;
    let bordaLateralPele = 0;
    let cantosSuperioresTotal = 0;
    let cantosSuperioresPele = 0;

    let bordasEstruturais = 0;
    let gradSamplesTotais = 0;

    const step = 2;
    const stride = width * 4;

    for (let y = 0; y < height; y += step) {
      const rowIdx = Math.min(rows - 1, Math.floor((y / height) * rows));
      const ny = y / height;

      for (let x = 0; x < width; x += step) {
        const colIdx = Math.min(cols - 1, Math.floor((x / width) * cols));
        const cellIdx = rowIdx * cols + colIdx;
        const nx = x / width;

        const idx = y * stride + x * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        totalSamples++;
        somaY += lum;
        somaY2 += lum * lum;

        if (lum < 55) pixelsEscuros++;
        if (lum < 30) pixelsMuitoEscuros++;
        if (lum >= 75) pixelsBrilhoUtil++;

        if (x >= step && y >= step) {
          const leftIdx = y * stride + (x - step) * 4;
          const topIdx = (y - step) * stride + x * 4;
          const lumLeft = 0.299 * data[leftIdx] + 0.587 * data[leftIdx + 1] + 0.114 * data[leftIdx + 2];
          const lumTop = 0.299 * data[topIdx] + 0.587 * data[topIdx + 1] + 0.114 * data[topIdx + 2];
          const gx = Math.abs(lum - lumLeft);
          const gy = Math.abs(lum - lumTop);
          gradSamplesTotais++;
          if (gx >= 18 || gy >= 18) bordasEstruturais++;
        }

        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        const maxRgb = Math.max(r, g, b);
        const minRgb = Math.min(r, g, b);
        const deltaRgb = maxRgb - minRgb;
        const sat = maxRgb > 0 ? deltaRgb / maxRgb : 0;

        const isAmareloPuro = r > 210 && g > 205 && b < 75;
        const isPelePadrao =
          !isAmareloPuro &&
          lum >= 35 && lum <= 242 &&
          cr >= 130 && cr <= 178 &&
          cb >= 74 && cb <= 135 &&
          r > g - 3 &&
          r > b + 8 &&
          r - g <= 92 &&
          deltaRgb >= 12 &&
          sat >= 0.08 && sat <= 0.72;

        const isPeleLuzMonitor =
          !isAmareloPuro &&
          lum >= 45 && lum <= 230 &&
          cr >= 125 && cr <= 168 &&
          cb >= 82 && cb <= 142 &&
          r >= g &&
          r >= b + 5 &&
          deltaRgb >= 10 &&
          sat >= 0.07 && sat <= 0.6;

        const isPele = isPelePadrao || isPeleLuzMonitor;

        cellTotal[cellIdx]++;
        cellSumY[cellIdx] += lum;
        cellSumY2[cellIdx] += lum * lum;
        if (isPele) cellSkin[cellIdx]++;
        if (lum < 68) cellDarkFeatures[cellIdx]++;

        const isZonaCentralEstrita = nx >= 0.3 && nx <= 0.7 && ny >= 0.2 && ny <= 0.78;
        if (isZonaCentralEstrita) {
          centroTotal++;
          centroSomaY += lum;
          centroSomaY2 += lum * lum;
          if (isPele) centroPele++;
          if (lum < 68) centroFeicoesEscuras++;

          if (y >= step) {
            const prevIdx = (y - step) * stride + x * 4;
            const prevLum = 0.299 * data[prevIdx] + 0.587 * data[prevIdx + 1] + 0.114 * data[prevIdx + 2];
            centroSomaGradVertical += Math.abs(lum - prevLum);
            centroGradSamples++;
          }
        }

        if (nx < 0.2 || nx > 0.8) {
          bordaLateralTotal++;
          if (isPele) bordaLateralPele++;
        }
        if (ny < 0.22 && (nx < 0.22 || nx > 0.78)) {
          cantosSuperioresTotal++;
          if (isPele) cantosSuperioresPele++;
        }
      }
    }

    const luminanciaMedia = totalSamples > 0 ? somaY / totalSamples : 0;
    const varianciaY = totalSamples > 0 ? Math.max(0, somaY2 / totalSamples - luminanciaMedia * luminanciaMedia) : 0;
    const desvioLuminancia = Math.sqrt(varianciaY);
    const percentualEscuros = totalSamples > 0 ? pixelsEscuros / totalSamples : 1;
    const percentualMuitoEscuros = totalSamples > 0 ? pixelsMuitoEscuros / totalSamples : 1;
    const percentualBrilhoUtil = totalSamples > 0 ? pixelsBrilhoUtil / totalSamples : 0;
    const taxaBordasEstruturais = gradSamplesTotais > 0 ? bordasEstruturais / gradSamplesTotais : 0;

    const baixaLuz =
      luminanciaMedia < 64 ||
      percentualEscuros > 0.55 ||
      percentualMuitoEscuros > 0.35 ||
      percentualBrilhoUtil < 0.2 ||
      (luminanciaMedia < 78 && desvioLuminancia < 14);

    const taxaPeleCentro = centroTotal > 0 ? centroPele / centroTotal : 0;
    const taxaFeicoesEscurasCentro = centroTotal > 0 ? centroFeicoesEscuras / centroTotal : 0;
    const mediaYCentro = centroTotal > 0 ? centroSomaY / centroTotal : 0;
    const desvioLuminanciaCentro =
      centroTotal > 0 ? Math.sqrt(Math.max(0, centroSomaY2 / centroTotal - mediaYCentro * mediaYCentro)) : 0;
    const gradienteVerticalCentro = centroGradSamples > 0 ? centroSomaGradVertical / centroGradSamples : 0;

    const taxaPeleBordas = bordaLateralTotal > 0 ? bordaLateralPele / bordaLateralTotal : 0;
    const taxaPeleCantosSuperiores = cantosSuperioresTotal > 0 ? cantosSuperioresPele / cantosSuperioresTotal : 0;

    let celulasMioloCentralComPele = 0;
    let maxPeleMioloCentral = 0;
    let desvioNoClusterCentral = 0;
    let feicoesEscurasNoClusterCentral = 0;

    for (let r = 1; r <= 4; r++) {
      for (let c = 2; c <= 5; c++) {
        const idx = r * cols + c;
        const tot = cellTotal[idx];
        if (tot <= 0) continue;
        const ratio = cellSkin[idx] / tot;
        const darkRatio = cellDarkFeatures[idx] / tot;
        const meanCell = cellSumY[idx] / tot;
        const stdCell = Math.sqrt(Math.max(0, cellSumY2[idx] / tot - meanCell * meanCell));

        if (ratio >= 0.24) {
          celulasMioloCentralComPele++;
          if (stdCell > desvioNoClusterCentral) desvioNoClusterCentral = stdCell;
          if (darkRatio > feicoesEscurasNoClusterCentral) feicoesEscurasNoClusterCentral = darkRatio;
        }
        if (ratio > maxPeleMioloCentral) maxPeleMioloCentral = ratio;
      }
    }

    let isSelfieCamera = facingModeAtual === 'user';
    try {
      const track = streamAtivo && streamAtivo.getVideoTracks ? streamAtivo.getVideoTracks()[0] : null;
      const settings = track && track.getSettings ? track.getSettings() : {};
      if (settings.facingMode === 'user') isSelfieCamera = true;
    } catch (_) {}

    const razaoPicoCantos = maxPeleMioloCentral / Math.max(0.02, taxaPeleCantosSuperiores);
    const razaoPicoBordas = maxPeleMioloCentral / Math.max(0.02, taxaPeleBordas);

    const padraoPessoaNoCentro =
      maxPeleMioloCentral >= 0.34 &&
      celulasMioloCentralComPele >= 3 &&
      taxaPeleCentro >= 0.24 &&
      (razaoPicoCantos >= 1.5 || razaoPicoBordas >= 1.4) &&
      (desvioLuminanciaCentro >= 12.0 || desvioNoClusterCentral >= 11.5) &&
      (gradienteVerticalCentro >= 4.5 || taxaFeicoesEscurasCentro >= 0.014 || feicoesEscurasNoClusterCentral >= 0.018);

    const pessoaNoCentro = facesNoCentroApi > 0 || padraoPessoaNoCentro;
    const selfieLateral = !pessoaNoCentro && (facesDetectadasApi > 0 || taxaPeleBordas >= 0.1 || isSelfieCamera);
    const semEstruturaArquitetonica = !baixaLuz && desvioLuminancia < 11.5 && taxaBordasEstruturais < 0.015;
    const foraDeContexto = semEstruturaArquitetonica;

    return {
      baixaLuz,
      pessoaNoCentro,
      rostoNoCentro: pessoaNoCentro,
      rostoDetectado: pessoaNoCentro,
      selfiePermitida: true,
      selfieLateral,
      isSelfieCamera,
      facesDetectadas: facesDetectadasApi,
      facesNoCentro: facesNoCentroApi || (pessoaNoCentro ? 1 : 0),
      foraDeContexto,
      contextoConstrucao: !foraDeContexto,
      luminanciaMedia: Number(luminanciaMedia.toFixed(1)),
      desvioLuminancia: Number(desvioLuminancia.toFixed(1)),
      percentualEscuros: Number(percentualEscuros.toFixed(3)),
      percentualMuitoEscuros: Number(percentualMuitoEscuros.toFixed(3)),
      taxaPeleCentro: Number(taxaPeleCentro.toFixed(3)),
      maxPeleCelulaCentral: Number(maxPeleMioloCentral.toFixed(3)),
      taxaBordasEstruturais: Number(taxaBordasEstruturais.toFixed(4)),
      categoriaSugerida: baixaLuz
        ? 'BAIXA_LUZ'
        : pessoaNoCentro
        ? 'PESSOA_NO_CENTRO'
        : foraDeContexto
        ? 'FORA_DE_CONTEXTO'
        : 'OBRA_LOCAL',
    };
  }

  function mostrarControlesPosCaptura(status = 'APROVADO', resultado = {}) {
    const isAprovado = status === 'APROVADO';
    const isManual = status === 'VALIDACAO_MANUAL';
    const podeAvancar = isAprovado || isManual;
    const verifiedIcon = document.getElementById('verifiedBannerIcon');

    if (btnDisparar) btnDisparar.classList.add('hidden');
    if (postCaptureActions) postCaptureActions.classList.remove('hidden');
    if (camVerifiedBanner) {
      camVerifiedBanner.classList.remove('hidden');
      if (isAprovado) {
        camVerifiedBanner.style.background = '';
        camVerifiedBanner.style.borderColor = '';
        if (verifiedIcon) {
          verifiedIcon.textContent = '✓';
          verifiedIcon.style.background = '#10B981';
          verifiedIcon.style.color = '#FFFFFF';
        }
      } else if (isManual) {
        camVerifiedBanner.style.background = 'rgba(245, 158, 11, 0.18)';
        camVerifiedBanner.style.borderColor = '#F59E0B';
        if (verifiedIcon) {
          verifiedIcon.textContent = '!';
          verifiedIcon.style.background = '#F59E0B';
          verifiedIcon.style.color = '#FFFFFF';
        }
      } else {
        camVerifiedBanner.style.background = 'rgba(239, 68, 68, 0.18)';
        camVerifiedBanner.style.borderColor = '#EF4444';
        if (verifiedIcon) {
          verifiedIcon.textContent = '✕';
          verifiedIcon.style.background = '#EF4444';
          verifiedIcon.style.color = '#FFFFFF';
        }
      }
    }

    if (btnAvancar) {
      if (podeAvancar) {
        btnAvancar.classList.remove('hidden');
        btnAvancar.disabled = false;
      } else {
        btnAvancar.classList.add('hidden');
        btnAvancar.disabled = true;
      }
    }

    if (camStepHint) {
      if (isAprovado) {
        camStepHint.innerText = 'Foto da obra/local validada pela IA. Clique em "Confirmar Foto e Avançar".';
      } else if (isManual) {
        camStepHint.innerText = 'Validação manual assistida ativa. Confirme para prosseguir com auditoria do Fiscal.';
      } else {
        camStepHint.innerText = `${resultado.motivo || 'Foto reprovada pela IA.'} Clique em "Tirar Outra Foto".`;
      }
    }
  }

  async function executarAvaliacao() {
    const hasLiveVideo = Boolean(
      streamAtivo &&
        videoFeed &&
        videoFeed.readyState >= 2 &&
        videoFeed.videoWidth > 0 &&
        videoFeed.videoHeight > 0
    );

    if (!hasLiveVideo) {
      fotoCongelada = false;
      toast.error(
        'Câmera Real Obrigatória',
        'Ative e autorize a câmera do seu dispositivo para capturar a foto real da obra e validar com a IA.'
      );
      mostrarOverlayCameraIndisponivel(
        'A câmera do dispositivo não está ativa. Autorize a câmera para capturar a foto real da obra.'
      );
      await iniciarCamera();
      return;
    }

    fotoCongelada = true;
    if (relogioInterval) clearInterval(relogioInterval);

    const momentoDisparo = new Date();
    const dataCaptura = momentoDisparo.toLocaleDateString('pt-BR');
    const horaCaptura = momentoDisparo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    state.currentVistoria.dataFoto = dataCaptura;
    state.currentVistoria.horaFoto = horaCaptura;
    state.currentVistoria.timestampDisparo = momentoDisparo.toISOString();

    if (elMetaData) elMetaData.textContent = dataCaptura;
    if (elMetaHora) elMetaHora.textContent = horaCaptura;

    if (scannerOverlay) scannerOverlay.classList.remove('hidden');
    if (statusBadge) statusBadge.innerText = 'IA verificando obra/construção, iluminação e centro livre...';
    if (pulseDot) pulseDot.style.background = '#FED304';
    if (warningBox) warningBox.classList.add('hidden');

    const startTime = performance.now();
    let telemetriaVisual = null;
    let base64Foto = null;

    try {
      const canvas = document.getElementById('liveCaptureCanvas');
      if (!canvas) throw new Error('Canvas de captura indisponível.');

      canvas.width = videoFeed.videoWidth;
      canvas.height = videoFeed.videoHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(videoFeed, 0, 0, canvas.width, canvas.height);

      // Pré-análise no frame bruto (antes da estampa)
      telemetriaVisual = await analisarCondicoesVisuaisIA(canvas, ctx, canvas.width, canvas.height);

      // Estampa temporal e geográfica inviolável
      const bannerH = Math.max(46, Math.round(canvas.height * 0.11));
      ctx.save();
      ctx.fillStyle = 'rgba(0, 27, 61, 0.90)';
      ctx.fillRect(0, canvas.height - bannerH, canvas.width, bannerH);
      ctx.fillStyle = '#FED304';
      ctx.fillRect(0, canvas.height - bannerH, canvas.width, 3);

      ctx.fillStyle = '#FFFFFF';
      const fontSizeTitle = Math.max(12, Math.round(canvas.height * 0.028));
      ctx.font = `bold ${fontSizeTitle}px sans-serif`;
      ctx.fillText(`BBVision In-Loco • Data: ${dataCaptura}  Hora: ${horaCaptura}`, 14, canvas.height - bannerH + bannerH * 0.44);

      ctx.fillStyle = '#CBD5E1';
      const fontSizeSub = Math.max(10, Math.round(canvas.height * 0.022));
      ctx.font = `normal ${fontSizeSub}px sans-serif`;
      ctx.fillText(
        `Local: ${state.currentVistoria.localizacaoFoto || state.currentVistoria.endereco || 'Registro GPS'}`,
        14,
        canvas.height - bannerH + bannerH * 0.82
      );
      ctx.restore();

      base64Foto = canvas.toDataURL('image/jpeg', 0.92);

      if (mainStreamImg) {
        mainStreamImg.src = base64Foto;
        mainStreamImg.classList.remove('hidden');
      }
      if (videoFeed) videoFeed.classList.add('hidden');
      state.currentVistoria.fotoCamera = base64Foto;
      state.currentVistoria.fotoBase64 = base64Foto;

      const resultado = await api.avaliarFoto(base64Foto, telemetriaVisual);
      const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1);

      if (scannerOverlay) scannerOverlay.classList.add('hidden');
      state.setResultadoAvaliacaoIa(resultado);

      if (elMetaHash && resultado.hash_integridade) {
        elMetaHash.textContent = resultado.hash_integridade.substring(0, 28) + '...';
      }

      mostrarControlesPosCaptura(resultado.status, resultado);

      if (resultado.status === 'APROVADO') {
        const pct = Math.round((resultado.confianca || 0.95) * 100);
        if (statusBadge) statusBadge.innerText = `IA: Obra Validada (${elapsedSec}s ≤ 15s)`;
        if (pulseDot) pulseDot.style.background = '#10B981';
        if (lblVerified) lblVerified.innerText = 'Foto de Obra/Local Validada pela IA';
        if (lblSub) lblSub.innerText = `Confiança ${pct}% • Iluminação adequada e contexto de fiscalização aprovado`;
        toast.success('Foto Validada pela IA', `Local de obra e iluminação aprovados (${pct}% de confiança).`);
      } else if (resultado.status === 'VALIDACAO_MANUAL') {
        if (statusBadge) statusBadge.innerText = 'Validação Manual Assistida';
        if (pulseDot) pulseDot.style.background = '#F59E0B';
        if (lblVerified) lblVerified.innerText = 'Foto Capturada (Modo Validação Manual)';
        if (lblSub) lblSub.innerText = resultado.motivo || 'Sujeita à auditoria humana pelo Fiscal de Obra';
        if (lblMotivoManual && resultado.motivo) lblMotivoManual.textContent = resultado.motivo;
        if (modalManual) modalManual.classList.remove('hidden');
        toast.warning('Modo Resiliente', 'Validação manual assistida liberada.');
      } else {
        state.currentVistoria.fotoCamera = null;
        const tituloRejeicao =
          resultado.categoria === 'BAIXA_LUZ'
            ? 'Foto Reprovada • Baixa Iluminação'
            : resultado.categoria === 'PESSOA_NO_CENTRO' || resultado.categoria === 'ROSTO_SELFIE'
            ? 'Foto Reprovada • Pessoa Ocupando o Centro'
            : resultado.categoria === 'FORA_DE_CONTEXTO'
            ? 'Foto Reprovada • Fora do Contexto de Construção'
            : 'Foto Reprovada pela IA';

        if (statusBadge) statusBadge.innerText = tituloRejeicao;
        if (pulseDot) pulseDot.style.background = '#EF4444';
        if (lblVerified) lblVerified.innerText = tituloRejeicao;
        if (lblSub) lblSub.innerText = resultado.motivo || 'Enquadre uma obra, prédio, casa ou construção sem pessoas no centro.';
        if (warningBox && warningMsg) {
          warningMsg.innerText =
            resultado.motivo || 'Foto reprovada pela IA. Enquadre uma obra, prédio, casa ou construção com o centro livre.';
          warningBox.classList.remove('hidden');
        }
        toast.error(tituloRejeicao, resultado.motivo || 'Tire uma nova foto focando na obra, prédio, casa ou construção.');
      }
    } catch (err) {
      if (scannerOverlay) scannerOverlay.classList.add('hidden');
      console.warn('[Camera] Falha na chamada à API de avaliação:', err.message);

      // Mesmo offline/erro, regras básicas de qualidade (baixa luz / pessoa no centro / cena lisa) continuam barrando fotos inválidas
      if (telemetriaVisual && (telemetriaVisual.baixaLuz || telemetriaVisual.pessoaNoCentro || telemetriaVisual.foraDeContexto)) {
        state.currentVistoria.fotoCamera = null;
        const categoriaRejeicao = telemetriaVisual.baixaLuz
          ? 'BAIXA_LUZ'
          : telemetriaVisual.pessoaNoCentro
          ? 'PESSOA_NO_CENTRO'
          : 'FORA_DE_CONTEXTO';
        const motivoRejeicao =
          categoriaRejeicao === 'BAIXA_LUZ'
            ? 'Reprovado: Imagem com baixa iluminação. Ilumine o local da obra antes de capturar.'
            : categoriaRejeicao === 'PESSOA_NO_CENTRO'
            ? 'Reprovado: Pessoas e selfies são permitidas nas laterais, mas o centro deve destacar a obra ou construção.'
            : 'Reprovado: A foto deve retratar uma obra, prédio, edifício, casa ou construção.';

        const resultadoRejeitado = {
          status: 'REJEITADO',
          categoria: categoriaRejeicao,
          confianca: 0.2,
          motivo: motivoRejeicao,
        };
        state.setResultadoAvaliacaoIa(resultadoRejeitado);
        mostrarControlesPosCaptura('REJEITADO', resultadoRejeitado);

        const tituloRejeicao =
          categoriaRejeicao === 'BAIXA_LUZ'
            ? 'Foto Reprovada • Baixa Iluminação'
            : categoriaRejeicao === 'PESSOA_NO_CENTRO'
            ? 'Foto Reprovada • Pessoa Ocupando o Centro'
            : 'Foto Reprovada • Fora do Contexto de Construção';
        if (statusBadge) statusBadge.innerText = tituloRejeicao;
        if (pulseDot) pulseDot.style.background = '#EF4444';
        if (lblVerified) lblVerified.innerText = tituloRejeicao;
        if (lblSub) lblSub.innerText = motivoRejeicao;
        if (warningBox && warningMsg) {
          warningMsg.innerText = motivoRejeicao;
          warningBox.classList.remove('hidden');
        }
        toast.error(tituloRejeicao, motivoRejeicao);
        return;
      }

      // Governança real (Seção 5.1): em falha de rede/timeout, aciona Validação Manual Assistida com hash SHA-256 local (nunca aprova como IA)
      const localHash = base64Foto ? await computeSha256FromDataUrl(base64Foto) : '';
      if (elMetaHash && localHash) {
        elMetaHash.textContent = localHash.substring(0, 28) + '...';
      }

      const motivoManual =
        'Validação manual assistida acionada devido à indisponibilidade temporária ou modo offline. Registro será sinalizado para auditoria humana pelo Fiscal de Obra.';
      const resultadoManual = {
        status: 'VALIDACAO_MANUAL',
        categoria: 'VALIDACAO_MANUAL',
        confianca: null,
        validacao_manual: true,
        hash_integridade: localHash,
        motivo: motivoManual,
      };

      state.setResultadoAvaliacaoIa(resultadoManual);
      mostrarControlesPosCaptura('VALIDACAO_MANUAL', resultadoManual);

      if (statusBadge) statusBadge.innerText = 'Validação Manual Assistida';
      if (pulseDot) pulseDot.style.background = '#F59E0B';
      if (lblVerified) lblVerified.innerText = 'Foto Capturada (Validação Manual)';
      if (lblSub) lblSub.innerText = 'Hash local gerado • Sujeita à auditoria do Fiscal';
      if (lblMotivoManual) lblMotivoManual.textContent = motivoManual;
      if (modalManual) modalManual.classList.remove('hidden');
      toast.warning('Validação Manual Assistida', 'Sem resposta do servidor de IA. Você pode prosseguir com auditoria manual pelo Fiscal.');
    }
  }

  document.getElementById('btnVoltarTipoLocal')?.addEventListener('click', () => {
    pararCamera();
    state.navigate('checklist-verificacao', null, { replace: true });
  });

  btnReativarCamera?.addEventListener('click', () => {
    iniciarCamera();
  });

  btnDisparar?.addEventListener('click', () => {
    executarAvaliacao();
  });

  btnAlternarCam?.addEventListener('click', () => {
    if (fotoCongelada) {
      toast.info('Foto Congelada', 'Clique em "Tirar Outra Foto" para reativar a câmera e alternar a lente.');
      return;
    }
    facingModeAtual = facingModeAtual === 'environment' ? 'user' : 'environment';
    iniciarCamera();
  });

  btnAvancar?.addEventListener('click', () => {
    if (state.currentVistoria.statusIA === 'REJEITADO') {
      toast.error('Foto Reprovada pela IA', 'A foto atual foi reprovada. Tire uma nova foto da obra/local com boa iluminação.');
      return;
    }
    if (!state.currentVistoria.fotoCamera) {
      toast.warning('Capture a Foto Primeiro', 'Clique no botão "Capturar Foto da Obra" antes de avançar.');
      return;
    }
    pararCamera();
    state.navigate('imagem-protegida');
  });

  btnRetake?.addEventListener('click', async () => {
    fotoCongelada = false;
    state.currentVistoria.fotoCamera = null;
    state.currentVistoria.fotoBase64 = null;
    state.currentVistoria.caminhoArquivoFoto = null;
    state.currentVistoria.statusIA = null;
    state.currentVistoria.validacaoManual = false;
    state.currentVistoria.hashSha256 = '';
    if (elMetaHash) elMetaHash.textContent = 'Pendente de disparo';

    iniciarRelogioTempoReal();
    iniciarGpsTempoReal();
    if (warningBox) warningBox.classList.add('hidden');
    if (btnDisparar) btnDisparar.classList.remove('hidden');
    if (postCaptureActions) postCaptureActions.classList.add('hidden');
    if (camVerifiedBanner) camVerifiedBanner.classList.add('hidden');
    if (camStepHint) {
      camStepHint.innerText = 'Enquadre a obra, prédio, casa ou construção no centro (selfie/pessoas permitidas nas laterais)';
    }

    if (mainStreamImg) mainStreamImg.classList.add('hidden');
    if (!streamAtivo) {
      const ok = await iniciarCamera();
      if (ok) {
        toast.info('Nova Captura', 'Câmera reativada. Enquadre a obra, prédio, casa ou construção.');
      }
    } else {
      if (videoFeed) videoFeed.classList.remove('hidden');
      ocultarOverlayCameraIndisponivel();
      if (statusBadge) statusBadge.innerText = 'Câmera Ativa • IA Pronta';
      if (pulseDot) pulseDot.style.background = '#10B981';
      toast.info('Nova Captura', 'Câmera reativada. Enquadre a obra, prédio, casa ou construção.');
    }
  });

  document.getElementById('btnCancelarManual')?.addEventListener('click', () => {
    modalManual?.classList.add('hidden');
    btnRetake?.click();
  });

  document.getElementById('btnConfirmarManual')?.addEventListener('click', () => {
    modalManual?.classList.add('hidden');
    state.currentVistoria.validacaoManual = true;
    state.currentVistoria.statusIA = 'VALIDACAO_MANUAL';
    pararCamera();
    state.navigate('imagem-protegida');
  });

  // Inicialização condicional: se já há foto válida congelada, preserva visualização sem sobrescrever
  if (!fotoValidaExistente) {
    iniciarRelogioTempoReal();
    iniciarGpsTempoReal();
    iniciarCamera();
  }

  // Retorna função de cleanup para app.js encerrar câmera/GPS em qualquer troca de rota
  return pararCamera;
}
