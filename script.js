// Prompt Generator - Versi 1.7.0 (JWT Auth & DB Coin System)
// Disimpan pada: Jumat, 27 Juni 2025

document.addEventListener('DOMContentLoaded', () => {

    // [MODIFIED] Authentication Check at the beginning
    const token = localStorage.getItem('userAuthToken');
    if (!token) {
        window.location.href = 'login.html'; // Redirect if no token
        return; 
    }

    // --- ELEMENT SELECTORS (Grouped for clarity) ---

    // General UI
    const userNavContainer = document.getElementById('user-nav-container'); // Container for user info and logout
    
    // Modals and their controls
    const guideBtn = document.getElementById('guideBtn');
    const guideModal = document.getElementById('guideModal');
    const closeGuideBtn = document.getElementById('closeGuideBtn');
    const openCharacterCreatorBtn = document.getElementById('openCharacterCreatorBtn');
    const characterCreatorModal = document.getElementById('characterCreatorModal');
    const closeCharacterCreatorBtn = document.getElementById('closeCharacterCreatorBtn');
    const loadCharacterModal = document.getElementById('loadCharacterModal');
    const closeLoadCharacterBtn = document.getElementById('closeLoadCharacterBtn');
    const characterList = document.getElementById('characterList');

    // --- Scene Mode Selectors ---
    const singleSceneBtn = document.getElementById('singleSceneBtn');
    const conversationSceneBtn = document.getElementById('conversationSceneBtn');
    const singleSceneModeContainer = document.getElementById('singleSceneModeContainer');
    const conversationSceneModeContainer = document.getElementById('conversationSceneModeContainer');
    const sceneCharactersList = document.getElementById('sceneCharactersList');
    const addSceneCharacterBtn = document.getElementById('addSceneCharacterBtn');
    const dialogueEditor = document.getElementById('dialogueEditor');
    const addDialogueLineBtn = document.getElementById('addDialogueLineBtn');

    // Manual Prompt Form
    const inputs = {
        subjek: document.getElementById('subjek'),
        aksi: document.getElementById('aksi'),
        ekspresi: document.getElementById('ekspresi'),
        tempat: document.getElementById('tempat'),
        waktu: document.getElementById('waktu'),
        sudutKamera: document.getElementById('sudutKamera'),
        kamera: document.getElementById('kamera'),
        pencahayaan: document.getElementById('pencahayaan'),
        style: document.getElementById('style'),
        suasana: document.getElementById('suasana'),
        backsound: document.getElementById('backsound'),
        kalimat: document.getElementById('kalimat'),
        detail: document.getElementById('detail'),
        sceneInteraction: document.getElementById('sceneInteraction')
    };
    const generateBtn = document.getElementById('generateBtn');
    const saveCharacterBtn = document.getElementById('saveCharacterBtn');
    const loadCharacterBtn = document.getElementById('loadCharacterBtn');
    
    // Prompt Output & Actions
    const promptIndonesia = document.getElementById('promptIndonesia');
    const promptEnglish = document.getElementById('promptEnglish');
    const copyBtnId = document.getElementById('copyBtnId');
    const copyBtnEn = document.getElementById('copyBtnEn');
    const openGeminiIdBtn = document.getElementById('openGeminiIdBtn');
    const openGeminiEnBtn = document.getElementById('openGeminiEnBtn');

    // Single Image Description Elements
    const imageUploadInput = document.getElementById('imageUploadInput');
    const imagePreview = document.getElementById('imagePreview');
    const imageUploadIcon = document.getElementById('imageUploadIcon');
    const imageUploadContainer = document.getElementById('imageUploadContainer');
    const describeSubjectBtn = document.getElementById('describeSubjectBtn');
    const describePlaceBtn = document.getElementById('describePlaceBtn');

    // Character Creator Modal Elements
    const createCharacterBtn = document.getElementById('createCharacterBtn');
    const characterStyleSelect = document.getElementById('characterStyle');
    const characterUploads = {
        face: {
            input: document.getElementById('input-face'),
            preview: document.getElementById('preview-face'),
            icon: document.getElementById('icon-face'),
            container: document.getElementById('upload-container-face')
        },
        clothing: {
            input: document.getElementById('input-clothing'),
            preview: document.getElementById('preview-clothing'),
            icon: document.getElementById('icon-clothing'),
            container: document.getElementById('upload-container-clothing')
        },
        accessories: {
            input: document.getElementById('input-accessories'),
            preview: document.getElementById('preview-accessories'),
            icon: document.getElementById('icon-accessories'),
            container: document.getElementById('upload-container-accessories')
        }
    };
    
    // --- STATE MANAGEMENT ---
    let singleUploadedImageData = null; 
    let characterImageData = { face: null, clothing: null, accessories: null };
    let currentSceneMode = 'single';
    let selectedCharacters = [];
    let dialogueLines = [];


    // --- TOKEN-BASED USER INFO & LOGOUT ---
    function setupUserNav() {
        if(!userNavContainer) return;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userNavContainer.innerHTML = `
                <div class="flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700 shadow-lg">
                    <span class="text-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                          <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
                          <path d="M8 11.732a.75.75 0 0 1 .75-.75h.025a.75.75 0 0 1 0 1.5H8.75a.75.75 0 0 1-.75-.75M6.625 5.34a.75.75 0 0 0-1.5 0v1.445a.75.75 0 0 0 1.5 0z"/>
                          <path d="M9.19 8.28a.75.75 0 0 0-1.06-1.06l-1.445 1.444a.75.75 0 1 0 1.06 1.06z"/>
                        </svg>
                    </span>
                    <span id="coinCount" class="font-semibold text-white">0</span>
                </div>
                 <span class="text-white font-semibold hidden sm:block">
                    Halo, ${payload.username}
                </span>
                <a href="#" id="logoutBtn" title="Logout" class="bg-red-600 hover:bg-red-700 text-white font-bold h-8 w-8 rounded-full text-lg transition-colors flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                      <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                    </svg>
                 </a>
            `;
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('userAuthToken');
                window.location.href = 'login.html';
            });
        } catch (error) {
            console.error("Invalid token, redirecting to login.");
            localStorage.removeItem('userAuthToken');
            window.location.href = 'login.html';
        }
    }


    // --- COIN SYSTEM (now uses database via token) ---
    function updateCoinDisplay(count) {
        const coinCountEl = document.getElementById('coinCount');
        if (coinCountEl) {
            coinCountEl.textContent = count;
        }
        updateButtonState(count);
    }
    
    async function callAuthenticatedApi(action, payload = {}) {
        const token = localStorage.getItem('userAuthToken');
        if (!token) {
            window.location.href = 'login.html';
            throw new Error("Token tidak ditemukan.");
        }

        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Send the token
            },
            body: JSON.stringify({ action, ...payload })
        });
        
        if (response.status === 401) { // Unauthorized (e.g., token expired)
            localStorage.removeItem('userAuthToken');
            window.location.href = 'login.html';
            throw new Error("Sesi tidak valid, silakan login kembali.");
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Terjadi kesalahan pada server.');
        }
        return result;
    }

    async function loadCoins() {
        try {
            const result = await callAuthenticatedApi('get_coins');
            updateCoinDisplay(result.coins);
        } catch (error) {
            console.error('Gagal memuat koin:', error.message);
            if(error.message.includes("login") || error.message.includes("Sesi")) {
                window.location.href = 'login.html';
            }
        }
    }

    function updateButtonState(currentCoins) {
        if (generateBtn.disabled) return;
        const canGenerate = currentCoins >= 1;
        const canCreateCharacter = currentCoins >= 3;

        generateBtn.textContent = canGenerate ? 'Generate Prompt' : 'Koin Habis';
        
        if (createCharacterBtn) {
            if (!canCreateCharacter) {
                 createCharacterBtn.textContent = 'Koin Kurang (Butuh 3)';
            } else {
                 createCharacterBtn.textContent = 'Buat Karakter & Isi Subjek';
            }
        }
    }
    
    // --- UI & UTILITY FUNCTIONS ---
    function showCopyFeedback(button, text = 'Berhasil Disalin!') {
        const originalText = button.textContent;
        const originalColorClasses = Array.from(button.classList).filter(c => c.startsWith('bg-') || c.startsWith('hover:bg-'));
        button.textContent = text;
        button.classList.remove(...originalColorClasses);
        button.classList.add('bg-green-600', 'hover:bg-green-700');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-600', 'hover:bg-green-700');
            button.classList.add(...originalColorClasses);
        }, 2000);
    }
    
    function fallbackCopyText(textarea, button, feedbackText = 'Berhasil Disalin!') {
        textarea.select();
        textarea.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            showCopyFeedback(button, feedbackText);
        } catch (err) {
            console.error('Fallback: Gagal menyalin', err);
        }
    }

    function copyText(textarea, button) {
        const promptText = textarea.value.trim();
        if (!promptText) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(promptText).then(() => showCopyFeedback(button)).catch(() => fallbackCopyText(textarea, button));
        } else {
           fallbackCopyText(textarea, button);
        }
    }

    function openInGemini(textarea, button) {
        const promptText = textarea.value.trim();
        const geminiUrl = `https://gemini.google.com/app`;
        if (promptText) {
             if (navigator.clipboard) {
                navigator.clipboard.writeText(promptText).then(() => {
                    showCopyFeedback(button, 'Disalin!');
                    window.open(geminiUrl, '_blank');
                }).catch(() => fallbackCopyText(textarea, button, 'Disalin!'));
            } else {
                fallbackCopyText(textarea, button, 'Disalin!');
            }
        }
        window.open(geminiUrl, '_blank');
    }
    
    function flashButtonText(button, message, duration = 2000) {
        if (button.dataset.isFlashing) return;

        const originalText = button.textContent;
        button.dataset.isFlashing = 'true';
        button.textContent = message;

        setTimeout(() => {
            button.textContent = originalText;
            delete button.dataset.isFlashing;
        }, duration);
    }


    // --- GEMINI API INTEGRATION ---
    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function callGeminiAPIWithRetry(instruction, imageDataArray = [], maxRetries = 4) {
        let retries = 0;
        let waitTime = 1000; 

        while (retries < maxRetries) {
            const parts = [{ text: instruction }];
            (imageDataArray || []).forEach(imgData => {
                if (imgData && imgData.type && imgData.data) { 
                    parts.push({ inline_data: { mime_type: imgData.type, data: imgData.data } });
                }
            });
            
            const apiUrl = `/api/apigemini`;
            const payload = { contents: [{ parts: parts }] };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    return text.replace(/```json/g, '').replace(/```/g, '').trim();
                } else {
                    throw new Error("Invalid or empty response structure from API.");
                }
            } else if (response.status === 429) {
                retries++;
                console.warn(`API rate limit hit (429). Retrying in ${waitTime / 1000}s... (Attempt ${retries}/${maxRetries})`);
                if (retries < maxRetries) {
                    await delay(waitTime);
                    waitTime *= 2; 
                }
            } else {
                const errorBody = await response.text();
                console.error("Backend API Error Response:", errorBody);
                throw new Error(`API error: ${response.status} ${response.statusText}. Details: ${errorBody}`);
            }
        }
        throw new Error(`API request failed after ${maxRetries} retries.`);
    }

    // --- ACTION HANDLERS ---
    function setActionsDisabled(disabled) {
        generateBtn.disabled = disabled;
        describeSubjectBtn.disabled = disabled;
        describePlaceBtn.disabled = disabled;
        createCharacterBtn.disabled = disabled;
        saveCharacterBtn.disabled = disabled;
        loadCharacterBtn.disabled = disabled;

        if(!disabled) { 
            describeSubjectBtn.disabled = !singleUploadedImageData;
            describePlaceBtn.disabled = !singleUploadedImageData;
            loadCoins(); 
        }
    }

    async function handleApiInteraction(button, cost, apiFunction) {
        const originalButtonText = button.textContent;
        setActionsDisabled(true);
        
        try {
            button.textContent = 'Memvalidasi koin...';
            await callAuthenticatedApi('use_coin', { cost });

            button.textContent = 'Memproses...';
            await apiFunction();
            
            await loadCoins();
            
        } catch (error) {
            console.error("Interaction Error:", error);
            alert(`Terjadi kesalahan: ${error.message}`);
            await loadCoins();
        } finally {
            setActionsDisabled(false);
            button.textContent = originalButtonText;
        }
    }
    
    // --- SCENE MODE LOGIC ---
    function switchSceneMode(mode) {
        currentSceneMode = mode;
        if (mode === 'single') {
            singleSceneModeContainer.classList.remove('hidden');
            conversationSceneModeContainer.classList.add('hidden');
            singleSceneBtn.classList.replace('bg-gray-600', 'bg-indigo-600');
            singleSceneBtn.classList.replace('hover:bg-gray-700', 'hover:bg-indigo-700');
            conversationSceneBtn.classList.replace('bg-indigo-600', 'bg-gray-600');
            conversationSceneBtn.classList.replace('hover:bg-indigo-700', 'hover:bg-gray-700');
            inputs.kalimat.parentElement.classList.remove('hidden');

        } else if (mode === 'conversation') {
            singleSceneModeContainer.classList.add('hidden');
            conversationSceneModeContainer.classList.remove('hidden');
            conversationSceneBtn.classList.replace('bg-gray-600', 'bg-indigo-600');
            conversationSceneBtn.classList.replace('hover:bg-gray-700', 'hover:bg-indigo-700');
            singleSceneBtn.classList.replace('bg-indigo-600', 'bg-gray-600');
            singleSceneBtn.classList.replace('hover:bg-indigo-700', 'hover:bg-gray-700');
            inputs.kalimat.parentElement.classList.add('hidden');
        }
    }

    // --- MANUAL PROMPT LOGIC ---
    function generateIndonesianPrompt() {
        if (currentSceneMode === 'conversation') {
            const sceneContextParts = [
                inputs.tempat.value.trim() ? `di ${inputs.tempat.value.trim()}` : '',
                inputs.waktu.value.trim() ? `saat ${inputs.waktu.value.trim()}`: '',
                inputs.pencahayaan.value.trim() ? `dengan pencahayaan ${inputs.pencahayaan.value.trim()}`: '',
                inputs.suasana.value.trim() ? `suasana ${inputs.suasana.value.trim()}`: '',
            ].filter(Boolean);
            const sceneContext = sceneContextParts.length > 0 ? `// --- Scene Context ---\n${sceneContextParts.join(', ')}` : '';
            
            const interactionBlock = inputs.sceneInteraction.value.trim() ? `// --- Scene Interaction ---\n${inputs.sceneInteraction.value.trim()}` : '';

            const charactersBlock = selectedCharacters.length > 0 ? `// --- Characters in Scene ---\n${selectedCharacters.map(c => c.description).join('\n')}` : '';

            const dialogueBlock = dialogueLines.length > 0 ? `// --- Dialogue ---\n${dialogueLines.map(d => `${d.speaker || 'N/A'}: "${d.line || ''}" ${d.tone ? `(${d.tone})` : ''}`.trim()).join('\n')}` : '';
            
            const promptParts = [
                inputs.style.value,
                inputs.sudutKamera.value,
                inputs.kamera.value,
                sceneContext,
                interactionBlock,
                charactersBlock,
                dialogueBlock,
                inputs.backsound.value.trim() ? `// --- Audio ---\ndengan suara ${inputs.backsound.value.trim()}` : '',
                inputs.detail.value
            ];

            return promptParts.filter(part => part && part.trim()).join(',\n');
        }
        
        const subjectValue = inputs.subjek.value.trim();
        if (subjectValue.includes('// MASTER PROMPT / CHARACTER SHEET')) {
            const promptParts = [
                inputs.style.value,
                inputs.sudutKamera.value,
                inputs.kamera.value,
                subjectValue,
                inputs.aksi.value.trim() ? `// --- Action/Scene ---\n${inputs.aksi.value.trim()}` : '',
                inputs.ekspresi.value.trim() ? `dengan ekspresi ${inputs.ekspresi.value.trim()}` : '',
                inputs.tempat.value.trim() ? `di ${inputs.tempat.value.trim()}` : '',
                inputs.waktu.value.trim() ? `saat ${inputs.waktu.value.trim()}`: '',
                inputs.pencahayaan.value.trim() ? `dengan pencahayaan ${inputs.pencahayaan.value.trim()}`: '',
                inputs.suasana.value.trim() ? `suasana ${inputs.suasana.value.trim()}`: '',
                inputs.backsound.value.trim() ? `dengan suara ${inputs.backsound.value.trim()}` : '',
                inputs.kalimat.value.trim() ? `mengucapkan kalimat: "${inputs.kalimat.value.trim()}"` : '',
                inputs.detail.value
            ];
            return promptParts.filter(part => part && part.trim()).join(',\n');
        }

        let sceneDescription = `sebuah adegan tentang ${subjectValue || 'seseorang'}`;
        const action = inputs.aksi.value.trim();
        const expression = inputs.ekspresi.value.trim();
        if (action && expression) {
            sceneDescription += ` yang sedang ${action} dengan ekspresi ${expression}`;
        } else if (action) {
            sceneDescription += ` yang sedang ${action}`;
        } else if (expression) {
            sceneDescription += ` dengan ekspresi ${expression}`;
        }

        const place = inputs.tempat.value.trim();
        if (place) {
            sceneDescription += ` di ${place}`;
        }
        
        const time = inputs.waktu.value.trim();
        if (time) {
            sceneDescription += ` saat ${time}`;
        }
        
        const promptParts = [
            inputs.style.value,
            inputs.sudutKamera.value,
            inputs.kamera.value,
            sceneDescription,
            inputs.pencahayaan.value.trim() ? `dengan pencahayaan ${inputs.pencahayaan.value.trim()}`: '',
            inputs.suasana.value.trim() ? `suasana ${inputs.suasana.value.trim()}`: '',
            inputs.backsound.value.trim() ? `dengan suara ${inputs.backsound.value.trim()}` : '',
            inputs.kalimat.value.trim() ? `mengucapkan kalimat: "${inputs.kalimat.value.trim()}"` : '',
            inputs.detail.value
        ];

        return promptParts.filter(part => part && part.trim()).join(', ');
    }
    
    function createAndTranslatePrompt() {
        handleApiInteraction(generateBtn, 1, async () => {
            const indonesianPrompt = generateIndonesianPrompt();
            promptIndonesia.value = indonesianPrompt;
            promptEnglish.value = 'Menerjemahkan...';
            if (!indonesianPrompt) {
                promptEnglish.value = '';
                return;
            }
            const instruction = `Translate the following creative video prompt from Indonesian to English. Keep the structure and comma separation. Be concise and direct. Respond only with the translated prompt. Text to translate: "${indonesianPrompt}"`;
            promptEnglish.value = await callGeminiAPIWithRetry(instruction);
        });
    }

    // --- SINGLE IMAGE DESCRIPTION LOGIC ---
    function handleSingleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.classList.remove('hidden');
            imageUploadIcon.classList.add('hidden');
            singleUploadedImageData = { type: file.type, data: e.target.result.split(',')[1] };
            describeSubjectBtn.disabled = false;
            describePlaceBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    function describeSingleImage(type) {
        if (!singleUploadedImageData) {
            alert("Silakan unggah gambar pada bagian 'Deskripsikan dari Gambar' terlebih dahulu.");
            return;
        }
        const button = type === 'subject' ? describeSubjectBtn : describePlaceBtn;
        handleApiInteraction(button, 1, async () => {
            const instruction = type === 'subject'
                ? "Analisis secara spesifik hanya orang/subjek utama dalam gambar ini. Abaikan sepenuhnya latar belakang atau tempat. Berikan deskripsi mendetail dalam Bahasa Indonesia yang mencakup detail wajah, warna dan gaya rambut, pakaian dan aksesoris, warna kulit, dan perkiraan usia. Gabungkan semuanya menjadi satu frasa deskriptif yang kohesif. Balas HANYA dengan frasa deskriptif ini, tanpa teks atau format lain."
                : "Anda adalah seorang prompt engineer. Analisis gambar ini dan buatlah deskripsi prompt yang sinematik untuk latar belakangnya dalam Bahasa Indonesia. Fokus pada suasana, elemen visual kunci, dan mood. Abaikan orang atau subjek utama. Balas HANYA dengan deskripsi prompt ini, tanpa teks pembuka.";
            const description = await callGeminiAPIWithRetry(instruction, [singleUploadedImageData]);
            const targetInput = type === 'subject' ? inputs.subjek : inputs.tempat;
            targetInput.value = description;
        });
    }

    // --- CUSTOM CHARACTER CREATOR LOGIC ---
    function handleCharacterImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            characterUploads[type].preview.src = e.target.result;
            characterUploads[type].preview.classList.remove('hidden');
            characterUploads[type].icon.classList.add('hidden');
            characterImageData[type] = { type: file.type, data: e.target.result.split(',')[1] };
            if (createCharacterBtn) createCharacterBtn.disabled = !characterImageData.face;
        };
        reader.readAsDataURL(file);
    }
    
    function createCharacterDescription() {
        if (!characterImageData.face) {
            alert("Silakan unggah foto Wajah terlebih dahulu di dalam pop-up.");
            return;
        }
        
        handleApiInteraction(createCharacterBtn, 3, async () => {
            const characterName = prompt("Masukkan nama untuk karakter ini:", "Karakter Baru");
            if (!characterName) {
                throw new Error("Pembuatan karakter dibatalkan.");
            }

            const selectedStyle = characterStyleSelect.value;
            
            const hairInstruction = `Deskripsikan rambut dengan sangat detail, pecah ke dalam kategori berikut:
- **Warna Rambut:** Warna Rambut (jika warnanya tidak alami tambahkan imbuhan diwarnai).
- **Tekstur & Pola Rambut:** Tipe Rambut (lurus, bergelombang, ikal, keriting), Detail Tekstur (gelombang longgar/rapat, ikal spiral/besar), Kondisi Helai (tebal/tipis), Kehalusan/Kekusutan (halus, frizzy, flyaways).
- **Panjang & Potongan Rambut:** Panjang Keseluruhan (sebatas dagu (sekitar 15-25 cm), sebahu (sekitar 25-40 cm), sebatas punggung tengah (sekitar 40-60 cm), sangat panjang (lebih dari 60 cm)), Gaya Potongan/Haircut (bob, pixie, bixie, undercut, comma hair, two block, layer, blunt cut, shaggy), Poni (poni depan, curtain bangs).
- **Gaya & Penataan Rambut:** Penataan (tergerai, ekor kuda, dikepang), Belahan Rambut (tengah, samping), dan Aksesori (jepit, bando).
- **Kesan & Karakteristik Unik:** Volume (tebal/kempes), Kilau (berkilau/kusam), dan Detail lain (uban, ujung berwarna).`;
            
            let vibeInstruction, styleGuideline = "", clothingPrompt;
            if (selectedStyle === 'Fiksi') {
                vibeInstruction = `- "vibe": berikan deskripsi kesan atau "vibe" keseluruhan, dan tambahkan kata yang mengandung unsur fantasi (contoh: mystical, ethereal, otherworldly).`;
                clothingPrompt = `- "attire": deskripsikan pakaian secara detail. Pastikan deskripsi mengandung unsur fantasi (contoh: jubah ajaib, armor elf).`;
            } else { 
                vibeInstruction = `- "vibe": berikan deskripsi kesan atau "vibe" keseluruhan, dan pastikan TIDAK ADA kata yang mengandung unsur fantasi (contoh: professional, casual, sporty).`;
                styleGuideline = `PENTING: Untuk semua deskripsi, gunakan gaya bahasa yang harfiah, objektif, dan apa adanya seperti laporan identifikasi. Hindari penggunaan metafora, perumpamaan, atau bahasa puitis.`;
                clothingPrompt = `- "attire": deskripsikan pakaian atau busana secara detail.`;
            }

            const imageDataForApi = [];
            let imageContextText = "Analisis gambar-gambar berikut:\n";

            if (characterImageData.face) {
                imageContextText += "1. Gambar Wajah Karakter.\n";
                imageDataForApi.push(characterImageData.face);
            }
            if(characterImageData.clothing) {
                imageContextText += "2. Gambar Pakaian Karakter.\n";
                imageDataForApi.push(characterImageData.clothing);
            }
            if(characterImageData.accessories) {
                imageContextText += "3. Gambar Aksesori Karakter.\n";
                imageDataForApi.push(characterImageData.accessories);
            }
            
            const mainInstruction = `Berdasarkan gambar-gambar yang diberikan (${imageContextText.trim()}), analisis dan kembalikan sebuah objek JSON tunggal. Balas HANYA dengan objek JSON, tanpa teks atau format lain.
${styleGuideline}
Objek JSON harus memiliki semua kunci berikut: "identity", "demeanor", "vibe", "face_shape", "eyes", "nose", "lips", "hair", "skin", "facial_hair", "attire", "accessory".
- "identity": berikan deskripsi yang berisi jenis kelamin, perkiraan usia, dan asal negara/etnis (Contoh: "Seorang pria berusia 25 tahun dari Korea").
- "face_shape": berikan deskripsi yang mencakup bentuk wajah secara keseluruhan (oval, bulat, dll.), dahi, bentuk pipi, garis rahang, dan dagu.
- "eyes": berikan deskripsi yang mencakup warna mata (jika warnanya tidak alami tambahkan imbuhan memakai kontak lensa), bentuk mata, ukuran mata, bentuk dan ketebalan alis, serta bulu mata.
- "nose": berikan deskripsi yang mencakup Pangkal Hidung, Batang Hidung, Puncak Hidung, Lubang Hidung, Cuping Hidung.
- "lips": berikan deskripsi yang mencakup ketebalan, bentuk bibir, Proporsi Bibir Atas dan Bawah, Bentuk (Cupid's Bow), Lebar Bibir, Bentuk Sudut Bibir, Definisi Garis Bibir.
- "hair": berikan satu string tunggal yang merangkum semua detail rambut berdasarkan panduan berikut: ${hairInstruction}.
- "skin": berikan deskripsi yang mencakup warna kulit (jika tidak alami, sebutkan sebagai 'dengan make up'). Sebutkan juga tanda khusus seperti tahi lalat atau lesung pipi.
${clothingPrompt} Jawaban untuk "attire" harus berupa objek dengan kunci "top" dan "bottom".
- "accessory": deskripsikan aksesori utama yang terlihat. Jika tidak ada, nilainya harus "none".
${vibeInstruction}
- Untuk kunci lainnya ("demeanor", "facial_hair"), berikan deskripsi yang sesuai.`;
            
            const resultText = await callGeminiAPIWithRetry(mainInstruction, imageDataForApi);

            try {
                const data = JSON.parse(resultText);

                const finalDescription = `// MASTER PROMPT / CHARACTER SHEET: ${characterName} (v2.0)
(
    ${characterName.toLowerCase().replace(/ /g, '_')}:
    identity: ${data.identity || 'not specified'}.
    demeanor: ${data.demeanor || 'not specified'}.
    vibe: ${data.vibe || 'not specified'}.

    // --- Physical Appearance ---
    face_shape: ${data.face_shape || 'not specified'}.
    eyes: ${data.eyes || 'not specified'}.
    nose: ${data.nose || 'not specified'}.
    lips: ${data.lips || 'not specified'}.
    hair: (${data.hair || 'not specified'}:1.2).
    skin: ${data.skin || 'not specified'}.
    facial_hair: (${data.facial_hair || 'none'}:1.5).

    // --- Attire & Accessories ---
    attire:
        top: ${data.attire?.top || 'not specified'}.
        bottom: ${data.attire?.bottom || 'not specified'}.
    accessory: (${data.accessory || 'none'}:1.3).
)`.trim();
                
                inputs.subjek.value = finalDescription;
                characterCreatorModal.classList.add('hidden');

            } catch(e) {
                console.error("Gagal mem-parsing JSON dari API. Response:", resultText, "Error:", e);
                throw new Error("Gagal membuat Character Sheet karena respons API tidak valid.");
            }
        });
    }
    
    // --- CHARACTER SHEET & DIALOGUE LOGIC ---
    function getSavedCharacters() {
        return JSON.parse(localStorage.getItem('promptGenCharacters')) || [];
    }

    function saveCharacter() {
        const subject = inputs.subjek.value.trim();
        if (!subject) {
            alert("Kolom Subjek kosong, tidak ada yang bisa disimpan.");
            return;
        }

        let defaultName = "Karakter Baru";
        const nameMatch = subject.match(/\/\/\s*MASTER PROMPT\s*\/\s*CHARACTER SHEET:\s*(.*?)\s*\(v2.0\)/);
        if (nameMatch && nameMatch[1]) {
            defaultName = nameMatch[1].trim();
        }

        const characterName = prompt("Masukkan nama untuk karakter ini:", defaultName);
        if (!characterName) return;

        const characters = getSavedCharacters();
        const existingIndex = characters.findIndex(c => c.name === characterName);
        if (existingIndex > -1) {
            if (!confirm(`Karakter dengan nama "${characterName}" sudah ada. Apakah Anda ingin menimpanya?`)) {
                return;
            }
            characters[existingIndex].description = subject;
        } else {
            characters.push({ name: characterName, description: subject });
        }

        localStorage.setItem('promptGenCharacters', JSON.stringify(characters));
        flashButtonText(saveCharacterBtn, "Karakter Tersimpan!");
    }
    
    function populateCharacterModal(mode = 'single') {
        const characters = getSavedCharacters();
        characterList.innerHTML = ''; 
        
        const existingFooter = loadCharacterModal.querySelector('.modal-footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        if (characters.length === 0) {
            characterList.innerHTML = '<p class="text-gray-400">Belum ada karakter yang disimpan.</p>';
            return;
        }
        
        if (mode === 'single') {
            characters.forEach((char, index) => {
                const charEl = document.createElement('div');
                charEl.className = 'flex justify-between items-center p-3 bg-gray-700 rounded-lg';
                
                const nameEl = document.createElement('span');
                nameEl.textContent = char.name;
                nameEl.className = 'cursor-pointer hover:text-indigo-400';
                nameEl.onclick = () => {
                    inputs.subjek.value = char.description;
                    loadCharacterModal.classList.add('hidden');
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Hapus';
                deleteBtn.className = 'text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-full';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    if(confirm(`Apakah Anda yakin ingin menghapus karakter "${char.name}"?`)) {
                        characters.splice(index, 1);
                        localStorage.setItem('promptGenCharacters', JSON.stringify(characters));
                        populateCharacterModal(mode);
                    }
                };
                
                charEl.appendChild(nameEl);
                charEl.appendChild(deleteBtn);
                characterList.appendChild(charEl);
            });
        } else if (mode === 'conversation') {
             characters.forEach((char, index) => {
                const charEl = document.createElement('div');
                charEl.className = 'flex items-center p-3 bg-gray-700 rounded-lg';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `char-${index}`;
                checkbox.value = char.name;
                if (selectedCharacters.some(sc => sc.name === char.name)) {
                    checkbox.checked = true;
                }
                checkbox.className = 'h-4 w-4 text-indigo-600 bg-gray-600 border-gray-500 rounded focus:ring-indigo-500';
                
                const label = document.createElement('label');
                label.htmlFor = `char-${index}`;
                label.textContent = char.name;
                label.className = 'ml-3 block text-sm font-medium text-gray-300';
                
                charEl.appendChild(checkbox);
                charEl.appendChild(label);
                characterList.appendChild(charEl);
            });
            
            const footer = document.createElement('div');
            footer.className = 'modal-footer mt-4 pt-4 border-t border-gray-700';
            const addButton = document.createElement('button');
            addButton.textContent = 'Tambahkan ke Adegan';
            addButton.className = 'w-full text-white bg-indigo-600 hover:bg-indigo-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors';
            addButton.onclick = () => {
                const selectedCheckboxes = characterList.querySelectorAll('input[type="checkbox"]:checked');
                const newSelectedNames = Array.from(selectedCheckboxes).map(cb => cb.value);
                
                selectedCharacters = characters.filter(char => newSelectedNames.includes(char.name));

                renderSceneCharacters();
                renderDialogueEditor();
                loadCharacterModal.classList.add('hidden');
            };

            footer.appendChild(addButton);
            loadCharacterModal.querySelector('.bg-gray-800').appendChild(footer);
        }
        
        loadCharacterModal.classList.remove('hidden');
    }

    // --- Functions for Conversation Mode ---
    function renderSceneCharacters() {
        sceneCharactersList.innerHTML = '';
        if (selectedCharacters.length === 0) {
            sceneCharactersList.innerHTML = '<p class="text-sm text-gray-400">Belum ada karakter yang ditambahkan.</p>';
            return;
        }
        
        selectedCharacters.forEach(char => {
            const charEl = document.createElement('div');
            charEl.className = 'flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg';
            charEl.textContent = char.name;
            sceneCharactersList.appendChild(charEl);
        });
    }

    function addDialogueLine() {
        dialogueLines.push({ speaker: '', line: '', tone: ''});
        renderDialogueEditor();
    }

    function removeDialogueLine(index) {
        dialogueLines.splice(index, 1);
        renderDialogueEditor();
    }
    
    function renderDialogueEditor() {
        dialogueEditor.innerHTML = '';
        if (selectedCharacters.length === 0) {
            dialogueEditor.innerHTML = '<p class="text-sm text-gray-400 text-center">Tambahkan karakter terlebih dahulu untuk memulai dialog.</p>';
            return;
        }
        
        dialogueLines.forEach((dialogue, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'grid grid-cols-1 md:grid-cols-3 gap-2 items-center';

            const speakerSelect = document.createElement('select');
            speakerSelect.className = 'bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Pilih Pembicara...';
            speakerSelect.appendChild(defaultOption);

            selectedCharacters.forEach(char => {
                const option = document.createElement('option');
                option.value = char.name;
                option.textContent = char.name;
                if (dialogue.speaker === char.name) {
                    option.selected = true;
                }
                speakerSelect.appendChild(option);
            });
            speakerSelect.onchange = (e) => { dialogueLines[index].speaker = e.target.value; };

            const lineInput = document.createElement('input');
            lineInput.type = 'text';
            lineInput.value = dialogue.line;
            lineInput.placeholder = 'Dialog...';
            lineInput.className = 'md:col-span-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5';
            lineInput.oninput = (e) => { dialogueLines[index].line = e.target.value; };
            
            const actionContainer = document.createElement('div');
            actionContainer.className = 'md:col-span-3 grid grid-cols-3 gap-2';

            const toneInput = document.createElement('input');
            toneInput.type = 'text';
            toneInput.value = dialogue.tone;
            toneInput.placeholder = 'Nada/Ekspresi (opsional)...';
            toneInput.className = 'col-span-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5';
            toneInput.oninput = (e) => { dialogueLines[index].tone = e.target.value; };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Hapus';
            deleteBtn.className = 'col-span-1 text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2 text-center';
            deleteBtn.onclick = () => removeDialogueLine(index);
            
            actionContainer.appendChild(toneInput);
            actionContainer.appendChild(deleteBtn);

            lineEl.appendChild(speakerSelect);
            lineEl.appendChild(lineInput);
            lineEl.appendChild(actionContainer);
            dialogueEditor.appendChild(lineEl);
        });
    }

    // --- EVENT LISTENERS INITIALIZATION ---
    setupUserNav(); 
    loadCoins();    

    copyBtnId.addEventListener('click', () => copyText(promptIndonesia, copyBtnId));
    copyBtnEn.addEventListener('click', () => copyText(promptEnglish, copyBtnEn));
    openGeminiIdBtn.addEventListener('click', () => openInGemini(promptIndonesia, openGeminiIdBtn));
    openGeminiEnBtn.addEventListener('click', () => openInGemini(promptEnglish, openGeminiEnBtn));
    
    singleSceneBtn.addEventListener('click', () => switchSceneMode('single'));
    conversationSceneBtn.addEventListener('click', () => switchSceneMode('conversation'));
    addSceneCharacterBtn.addEventListener('click', () => populateCharacterModal('conversation'));
    addDialogueLineBtn.addEventListener('click', addDialogueLine);

    imageUploadInput.addEventListener('change', handleSingleImageUpload);
    describeSubjectBtn.addEventListener('click', () => {
        handleApiInteraction(describeSubjectBtn, 1, () => describeSingleImage('subject'));
    });
    describePlaceBtn.addEventListener('click', () => {
        handleApiInteraction(describePlaceBtn, 1, () => describeSingleImage('place'));
    });
    
    generateBtn.addEventListener('click', () => {
        handleApiInteraction(generateBtn, 1, createAndTranslatePrompt);
    });
    
    createCharacterBtn.addEventListener('click', createCharacterDescription);

    guideBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    guideModal.addEventListener('click', (e) => { if(e.target === guideModal) guideModal.classList.add('hidden'); });
    
    openCharacterCreatorBtn.addEventListener('click', () => characterCreatorModal.classList.remove('hidden'));
    closeCharacterCreatorBtn.addEventListener('click', () => characterCreatorModal.classList.add('hidden'));
    characterCreatorModal.addEventListener('click', (e) => { if(e.target === characterCreatorModal) characterCreatorModal.classList.add('hidden'); });
    
    saveCharacterBtn.addEventListener('click', saveCharacter);
    loadCharacterBtn.addEventListener('click', () => populateCharacterModal('single'));
    closeLoadCharacterBtn.addEventListener('click', () => loadCharacterModal.classList.add('hidden'));
    loadCharacterModal.addEventListener('click', (e) => { if (e.target === loadCharacterModal) loadCharacterModal.classList.add('hidden') });

    Object.keys(characterUploads).forEach(type => {
        const { input, container } = characterUploads[type];
        input.addEventListener('change', (e) => handleCharacterImageUpload(e, type));
        container.addEventListener('dragover', (e) => { e.preventDefault(); container.classList.add('border-indigo-500'); });
        container.addEventListener('dragleave', (e) => { e.preventDefault(); container.classList.remove('border-indigo-500'); });
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('border-indigo-500');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                input.files = files;
                handleCharacterImageUpload({ target: input }, type);
            }
        });
    });

    imageUploadContainer.addEventListener('dragover', (e) => { e.preventDefault(); imageUploadContainer.parentElement.classList.add('border-indigo-500'); });
    imageUploadContainer.addEventListener('dragleave', (e) => { e.preventDefault(); imageUploadContainer.parentElement.classList.remove('border-indigo-500'); });
    imageUploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadContainer.parentElement.classList.remove('border-indigo-500');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageUploadInput.files = files;
            handleSingleImageUpload({ target: imageUploadInput });
        }
    });

    // Initialize the default view
    switchSceneMode('single');
    renderDialogueEditor();
});
