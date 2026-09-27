document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. モバイルナビ（ハンバーガーメニュー） --- */
    const navToggle = document.getElementById('nav-toggle');
    const navArea = document.getElementById('nav-area');
    if (navToggle && navArea) {
        navToggle.addEventListener('click', () => {
            const isOpen = navArea.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        navArea.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navArea.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* --- 1. モード切り替え --- */
    const modeToggleBtn = document.getElementById('mode-toggle-btn');
    if (modeToggleBtn) {
        if (localStorage.getItem('site-mode') === 'heisei') {
            document.body.classList.add('heisei-mode');
            modeToggleBtn.textContent = 'MODERN MODEに戻す';
        }
        modeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('heisei-mode');
            if (document.body.classList.contains('heisei-mode')) {
                localStorage.setItem('site-mode', 'heisei');
                modeToggleBtn.textContent = 'MODERN MODEに戻す';
            } else {
                localStorage.setItem('site-mode', 'modern');
                modeToggleBtn.textContent = 'DARK MODE (??)';
            }
        });
    }

    /* --- 2. タブ切り替え --- */
    function setupTabs(btnSel, panelSel, dataAttr) {
        const btns = document.querySelectorAll(btnSel);
        const panels = document.querySelectorAll(panelSel);
        if (btns.length === 0) return;
        btns.forEach(btn => btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.getAttribute(dataAttr));
            if (target) target.classList.add('active');
        }));
    }
    setupTabs('.tab-btn', '.tab-panel', 'data-tab');
    setupTabs('.tool-tab-btn', '.tool-tab-panel', 'data-tool-tab');

    /* --- 3. カウンター --- */
    const counterElement = document.getElementById('visitor-counter');
    if (counterElement) {
        let count = parseInt(localStorage.getItem('visitor-count') || 4545, 10) + 1;
        localStorage.setItem('visitor-count', count);
        counterElement.textContent = String(count).padStart(8, '0');
    }

    /* --- 4. スライドショー --- */
    function initSlideshow(s, d, p, n, attr) {
        const slides = document.querySelectorAll(s), dots = document.querySelectorAll(d), prev = document.getElementById(p), next = document.getElementById(n);
        if (slides.length === 0 || !prev) return;
        let idx = 0;
        const show = (i) => {
            idx = (i + slides.length) % slides.length;
            slides.forEach(el => el.classList.remove('active'));
            dots.forEach(el => el.classList.remove('active'));
            slides[idx].classList.add('active');
            if (dots[idx]) dots[idx].classList.add('active');
        };
        prev.addEventListener('click', () => show(idx - 1));
        next.addEventListener('click', () => show(idx + 1));
        dots.forEach(dot => dot.addEventListener('click', () => show(parseInt(dot.getAttribute(attr)))));
    }
    initSlideshow('.slide', '.dot', 'slide-prev', 'slide-next', 'data-slide');
    initSlideshow('.hp-slide', '.hp-dot', 'hp-slide-prev', 'hp-slide-next', 'data-hp-slide');

    /* --- 5. CONTACT：メール送信 --- */
    const contactForm = document.querySelector('.dummy-form');
    if (contactForm && document.getElementById('name') && document.getElementById('message')) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const msg = document.getElementById('message').value;
            const subject = encodeURIComponent(`お仕事のご相談・ご依頼: ${name}様より`);
            const body = encodeURIComponent(`${name}様からのメッセージ:\n\n${msg}`);
            window.location.href = `mailto:info@cadenzworks.com?subject=${subject}&body=${body}`;
        });
    }

    /* --- 6. TOOLS：カラオケシステム --- */
    if (document.getElementById('request-list-container')) {
        const listContainer = document.getElementById('request-list-container');
        const updateDashboardList = () => {
            const queueData = JSON.parse(localStorage.getItem('demo_queue') || '[]');
            listContainer.innerHTML = queueData.length ? "" : "<p style='color:#666; font-size:13px; text-align:center; padding: 20px 0;'>待機曲はありません。</p>";
            queueData.forEach((req, index) => {
                const div = document.createElement('div');
                div.className = 'req-item-card';
                div.innerHTML = `<div class="req-info"><div class="req-title-text">🎵 ${req.title}</div><div class="req-sub-text">${req.artist} / ${req.user}さん</div></div><button class="sing-action-btn" data-index="${index}">歌う</button>`;
                listContainer.appendChild(div);
            });
            listContainer.querySelectorAll('.sing-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.getAttribute('data-index'), 10);
                    let q = JSON.parse(localStorage.getItem('demo_queue') || '[]');
                    if(q[idx]) {
                        document.getElementById('obs-now-playing').textContent = `🎤 「${q[idx].title}」 - 熱唱中！ (Req by ${q[idx].user})`;
                        q.splice(idx, 1);
                        localStorage.setItem('demo_queue', JSON.stringify(q));
                        updateDashboardList();
                    }
                });
            });
        };
        const sendBtn = document.getElementById('karaoke-send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                const title = document.getElementById('karaoke-song').value.trim();
                if (!title) return alert('曲名を入力してください');
                const newReq = { title, artist: document.getElementById('karaoke-artist').value.trim() || "不明", user: document.getElementById('karaoke-user').value.trim() || "匿名" };
                const q = JSON.parse(localStorage.getItem('demo_queue') || '[]');
                q.push(newReq);
                localStorage.setItem('demo_queue', JSON.stringify(q));
                document.getElementById('karaoke-song').value = "";
                alert('リクエスト送信完了！');
                updateDashboardList();
            });
        }
        const resetBtn = document.getElementById('karaoke-reset-btn');
        if(resetBtn) {
            resetBtn.addEventListener('click', () => {
                localStorage.removeItem('demo_queue');
                document.getElementById('obs-now-playing').textContent = "待機中...";
                updateDashboardList();
            });
        }
        document.querySelectorAll('.q-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('karaoke-song').value = e.target.getAttribute('data-song');
                document.getElementById('karaoke-artist').value = e.target.getAttribute('data-artist');
                if(!document.getElementById('karaoke-user').value) document.getElementById('karaoke-user').value = "デモくん";
                document.getElementById('karaoke-send-btn').click();
            });
        });
        setInterval(updateDashboardList, 1500);
        updateDashboardList();
    }

    /* --- 7. TOOLS：Living Studio --- */
    const outView = document.getElementById('outside-view');
    const roomView = document.getElementById('room-foreground');
    if (outView && roomView) {
        const envBtns = document.querySelectorAll('.living-controls .env-btn');
        const setEnvironment = (time, theme) => {
            const brightness = (time === 'day') ? 1.0 : 0.4;
            const fgSuffix = (theme === 'western') ? 'aa' : 'a'; 
            const bgSuffix = (theme === 'western') ? 'bb' : 'b'; 
            outView.style.backgroundImage = `url('images2/${time}${bgSuffix}.png')`;
            roomView.style.backgroundImage = `url('images2/${time}${fgSuffix}.png')`;
            outView.style.filter = `brightness(${brightness})`;
            envBtns.forEach(btn => {
                if (btn.getAttribute('data-time') === time && btn.getAttribute('data-theme') === theme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };
        setEnvironment('day', 'neon'); // 初期化
        envBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setEnvironment(btn.getAttribute('data-time'), btn.getAttribute('data-theme'));
            });
        });
    }

    /* --- 8. TOOLS：時計ステーション --- */
    if (document.getElementById('clock-hour-hand')) {
        const hHand = document.getElementById('clock-hour-hand'), mHand = document.getElementById('clock-minute-hand'), sHand = document.getElementById('clock-second-hand');
        const nDate = document.getElementById('neon-date'), nTime = document.getElementById('neon-time'), nDay = document.getElementById('neon-day');
        setInterval(() => {
            const now = new Date();
            const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
            sHand.style.transform = `rotate(${(s/60)*360}deg)`;
            mHand.style.transform = `rotate(${((m/60)*360)+((s/60)*6)}deg)`;
            hHand.style.transform = `rotate(${((h%12)/12*360)+((m/60)*30)}deg)`;
            
            const pad = num => String(num).padStart(2, '0');
            if(nDate) nDate.textContent = `${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())}`;
            if(nTime) nTime.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
            if(nDay) nDay.textContent = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"][now.getDay()];
        }, 1000);
    }

    /* --- 9. TOOLS：📅 予定表ジェネレーター --- */
    const dynamicInputsContainer = document.getElementById('dynamic-inputs-area'); 
    if (dynamicInputsContainer) {
        const viewGridContainer = document.getElementById('view-grid');
        const daysDef = [
            { key: 'mon', label: 'MON' }, { key: 'tue', label: 'TUE' }, { key: 'wed', label: 'WED' },
            { key: 'thu', label: 'THU' }, { key: 'fri', label: 'FRI' }, { key: 'sat', label: 'SAT' }, { key: 'sun', label: 'SUN' }
        ];
        const iconPalette = [
            { char: '🎤', label: '歌枠' }, { char: '🎮', label: 'ゲーム' }, { char: '💬', label: '雑談' }, { char: '🎬', label: '動画' },
            { char: '💤', label: '休み' }, { char: '🤝', label: 'コラボ' }, { char: '⚠️', label: '告知' }, { char: '🎉', label: '記念' },
            { char: '描', label: 'お絵描' }, { char: '📻', label: 'ラジオ' }, { char: '🛒', label: 'グッズ' }, { char: '✨', label: '自由' }
        ];
        const defaultSchedule = {
            mon: { layout: 'split',  am: { type: 'text', val: '定期雑談枠\n(朝活)' }, pm: { type: 'text', val: '歌枠練習' }, full: { type: 'text', val: '' } },
            tue: { layout: 'single', am: { type: 'text', val: '' }, pm: { type: 'text', val: '' }, full: { type: 'icon', val: '💤' } },
            wed: { layout: 'split',  am: { type: 'text', val: '' }, pm: { type: 'icon', val: '🎮' }, full: { type: 'text', val: '' } },
            thu: { layout: 'split',  am: { type: 'text', val: '作業配信' }, pm: { type: 'text', val: 'コラボ企画' }, full: { type: 'text', val: '' } },
            fri: { layout: 'split',  am: { type: 'text', val: '' }, pm: { type: 'icon', val: '🎤' }, full: { type: 'text', val: '' } },
            sat: { layout: 'split',  am: { type: 'text', val: 'ゲリラあるかも' }, pm: { type: 'text', val: 'ホラゲー配信' }, full: { type: 'text', val: '' } },
            sun: { layout: 'split',  am: { type: 'text', val: '同時視聴会' }, pm: { type: 'text', val: 'メン限配信' }, full: { type: 'text', val: '' } }
        };

        function createSlotRowHtml(dayKey, slotType, slotData, customLabel = null) {
            const isText = slotData.type === 'text';
            let html = `<div class="slot-input-row"><div class="slot-label"><span>${customLabel || slotType.toUpperCase()+' スロット'}</span>
                <div class="type-switcher"><div class="btn-switch ${isText?'active':''}" data-day="${dayKey}" data-slot="${slotType}" data-mode="text">文字</div><div class="btn-switch ${!isText?'active':''}" data-day="${dayKey}" data-slot="${slotType}" data-mode="icon">アイコン</div></div></div>
                <input type="text" id="input-${dayKey}-${slotType}-text" class="form-control slot-text-input" style="display:${isText?'block':'none'};" value="${isText?slotData.val:''}">
                <div id="picker-${dayKey}-${slotType}-icon" class="icon-picker-grid" style="display:${!isText?'grid':'none'};">`;
            iconPalette.forEach(icon => { html += `<div class="icon-option ${(!isText&&slotData.val===icon.char)?'active':''}" data-day="${dayKey}" data-slot="${slotType}" data-char="${icon.char}">${icon.char}</div>`; });
            return html + `</div></div>`;
        }

        daysDef.forEach((day, index) => {
            const defData = defaultSchedule[day.key], isSplit = defData.layout === 'split';
            const dayContainer = document.createElement('div');
            dayContainer.className = 'day-input-container';
            dayContainer.innerHTML = `<div class="form-group-header"><label style="color:#2c3e50;">${day.label} の設定</label><button type="button" class="btn-reset-each" data-day="${day.key}">リセット</button></div>
                <div style="display:flex; border-radius:4px; overflow:hidden; margin-bottom:12px;">
                    <div class="btn-layout-switch ${isSplit?'active':''}" data-day="${day.key}" data-layout="split">午前/午後 分割</div>
                    <div class="btn-layout-switch ${!isSplit?'active':''}" data-day="${day.key}" data-layout="single">1個に統合</div>
                </div>
                <div id="form-area-${day.key}-split" style="display:${isSplit?'block':'none'};">${createSlotRowHtml(day.key, 'am', defData.am)}<div style="margin-top:10px;"></div>${createSlotRowHtml(day.key, 'pm', defData.pm)}</div>
                <div id="form-area-${day.key}-single" style="display:${!isSplit?'block':'none'};">${createSlotRowHtml(day.key, 'full', defData.full, '統合スケジュール')}</div>`;
            dynamicInputsContainer.appendChild(dayContainer);

            const box = document.createElement('div');
            box.className = 'day-box';
            box.setAttribute('data-day-idx', index);
            box.innerHTML = `<div class="day-name">${day.label}</div>
                <div class="slot-split-wrapper" id="view-${day.key}-split-wrap">
                    <div class="slot slot-am"><span class="slot-ampm">AM</span><div class="slot-text" id="view-${day.key}-am"></div></div>
                    <div class="slot slot-pm"><span class="slot-ampm">PM</span><div class="slot-text" id="view-${day.key}-pm"></div></div>
                </div>
                <div class="slot-single-wrapper" id="view-${day.key}-single-wrap"><div class="single-mode-text" id="view-${day.key}-full"></div></div>`;
            viewGridContainer.appendChild(box);
        });

        const freeBox = document.createElement('div');
        freeBox.className = 'day-box free-space';
        freeBox.innerHTML = `<div class="day-name" id="view-free-label">NOTE</div><div class="slot-text" id="view-free-content"></div>`;
        viewGridContainer.appendChild(freeBox);

        function updateSlotPreview(dayKey, slotType) {
            const switcher = document.querySelector(`.btn-switch[data-day="${dayKey}"][data-slot="${slotType}"].active`);
            const viewEl = document.getElementById(`view-${dayKey}-${slotType}`);
            if (!switcher || !viewEl) return;
            if (switcher.getAttribute('data-mode') === 'text') {
                viewEl.innerText = document.getElementById(`input-${dayKey}-${slotType}-text`).value || 'ー';
            } else {
                const selectedIcon = document.querySelector(`.icon-option[data-day="${dayKey}"][data-slot="${slotType}"].active`);
                const iconVal = selectedIcon ? selectedIcon.getAttribute('data-char') : '✨';
                viewEl.innerHTML = `<span class="${slotType==='full'?'single-icon-render':'schedule-icon-render'}">${iconVal}</span>`;
            }
        }

        function updateDayLayout(dayKey, layoutMode) {
            const isSplit = layoutMode === 'split';
            document.getElementById(`form-area-${dayKey}-split`).style.display = isSplit ? 'block' : 'none';
            document.getElementById(`form-area-${dayKey}-single`).style.display = !isSplit ? 'block' : 'none';
            document.getElementById(`view-${dayKey}-split-wrap`).style.display = isSplit ? 'block' : 'none';
            document.getElementById(`view-${dayKey}-single-wrap`).style.display = !isSplit ? 'block' : 'none';
            if(isSplit) { updateSlotPreview(dayKey, 'am'); updateSlotPreview(dayKey, 'pm'); }
            else { updateSlotPreview(dayKey, 'full'); }
        }

        dynamicInputsContainer.addEventListener('click', (e) => {
            const layoutBtn = e.target.closest('.btn-layout-switch');
            if (layoutBtn) {
                const dKey = layoutBtn.getAttribute('data-day');
                layoutBtn.parentElement.querySelectorAll('.btn-layout-switch').forEach(b => b.classList.remove('active'));
                layoutBtn.classList.add('active');
                updateDayLayout(dKey, layoutBtn.getAttribute('data-layout'));
                return;
            }
            const swBtn = e.target.closest('.btn-switch');
            if (swBtn) {
                swBtn.parentElement.querySelectorAll('.btn-switch').forEach(b => b.classList.remove('active'));
                swBtn.classList.add('active');
                const dKey = swBtn.getAttribute('data-day'), slot = swBtn.getAttribute('data-slot');
                document.getElementById(`input-${dKey}-${slot}-text`).style.display = swBtn.getAttribute('data-mode')==='text'?'block':'none';
                document.getElementById(`picker-${dKey}-${slot}-icon`).style.display = swBtn.getAttribute('data-mode')==='icon'?'grid':'none';
                updateSlotPreview(dKey, slot);
                return;
            }
            const opt = e.target.closest('.icon-option');
            if (opt) {
                opt.parentElement.querySelectorAll('.icon-option').forEach(el => el.classList.remove('active'));
                opt.classList.add('active');
                updateSlotPreview(opt.getAttribute('data-day'), opt.getAttribute('data-slot'));
                return;
            }
            if (e.target.classList.contains('btn-reset-each')) {
                const dKey = e.target.getAttribute('data-day');
                e.target.closest('.day-input-container').querySelectorAll('input[type="text"]').forEach(i => i.value='');
                document.querySelector(`.btn-layout-switch[data-day="${dKey}"][data-layout="split"]`).click();
            }
        });

        dynamicInputsContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('slot-text-input')) {
                const parts = e.target.id.split('-');
                updateSlotPreview(parts[1], parts[2]);
            }
        });

        const scheduleAvatar = document.getElementById('schedule-avatar');
        document.getElementById('input-avatar').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    scheduleAvatar.src = ev.target.result;
                    scheduleAvatar.style.display = 'block';
                    document.getElementById('avatar-controls').style.display = 'block';
                    scheduleAvatar.style.transform = `translate(0px, 0px) scale(1.0)`;
                    document.getElementById('avatar-scale').value = 1.0;
                    document.getElementById('avatar-x').value = 0;
                    document.getElementById('avatar-y').value = 0;
                };
                reader.readAsDataURL(file);
            }
        });
        const updateAvatar = () => {
            scheduleAvatar.style.transform = `translate(${document.getElementById('avatar-x').value}px, ${document.getElementById('avatar-y').value}px) scale(${document.getElementById('avatar-scale').value})`;
        };
        ['avatar-scale','avatar-x','avatar-y'].forEach(id => document.getElementById(id).addEventListener('input', updateAvatar));

        ['input-title', 'input-period', 'input-free-label', 'input-free-content'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                document.getElementById(id.replace('input', 'view')).innerText = e.target.value;
            });
            const inputEl = document.getElementById(id);
            if(inputEl) document.getElementById(id.replace('input', 'view')).innerText = inputEl.value;
        });

        daysDef.forEach(d => updateDayLayout(d.key, defaultSchedule[d.key].layout));

        document.getElementById('design-selector').addEventListener('click', e => {
            if(!e.target.classList.contains('btn-select')) return;
            e.target.parentElement.querySelectorAll('.btn-select').forEach(b=>b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('schedule-card').setAttribute('data-design', e.target.getAttribute('data-value'));
        });
        document.getElementById('color-selector').addEventListener('click', e => {
            if(!e.target.classList.contains('btn-color')) return;
            e.target.parentElement.querySelectorAll('.btn-color').forEach(b=>b.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('schedule-card').setAttribute('data-color', e.target.getAttribute('data-value'));
        });

        // 💡 高画質PNG保存（透過背景対応、等倍クローン撮影）
        document.getElementById('btn-download').addEventListener('click', () => {
            const dlBtn = document.getElementById('btn-download');
            dlBtn.innerText = '画像生成中...';
            dlBtn.disabled = true;

            const origCard = document.getElementById('schedule-card');
            const cloneCard = origCard.cloneNode(true);
            cloneCard.style.transform = 'none';
            cloneCard.style.position = 'fixed';
            cloneCard.style.top = '-9999px';
            cloneCard.style.left = '-9999px';
            cloneCard.style.width = '1280px';
            cloneCard.style.height = '720px';
            document.body.appendChild(cloneCard);

            const origAvatar = origCard.querySelector('#schedule-avatar');
            const cloneAvatar = cloneCard.querySelector('#schedule-avatar');
            if (origAvatar && cloneAvatar) {
                cloneAvatar.style.transform = origAvatar.style.transform;
                cloneAvatar.style.display = origAvatar.style.display;
            }

            html2canvas(cloneCard, { scale: 2, useCORS: true, logging: false, backgroundColor: null, width: 1280, height: 720 }).then(canvas => {
                const link = document.createElement('a');
                const periodText = document.getElementById('input-period').value.replace(/[\s./:-]/g, '_') || 'demo';
                link.download = `schedule_${periodText}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                document.body.removeChild(cloneCard);
                dlBtn.innerText = 'PNG画像として保存（背景透過対応）';
                dlBtn.disabled = false;
            }).catch(err => {
                console.error('画像生成に失敗しました:', err);
                if(cloneCard.parentNode) document.body.removeChild(cloneCard);
                alert('画像の生成中にエラーが発生しました。');
                dlBtn.innerText = 'PNG画像として保存（背景透過対応）';
                dlBtn.disabled = false;
            });
        });
        
        document.getElementById('btn-clear-all').addEventListener('click', () => {
            if(!confirm('すべて初期化しますか？')) return;
            document.querySelectorAll('#dynamic-inputs-area input[type="text"]').forEach(i => i.value='');
            daysDef.forEach(d => document.querySelector(`.btn-reset-each[data-day="${d.key}"]`).click());
        });
    }

    /* --- 10. TOOLS：登録者数目標カウンター --- */
    const subCurrentInput = document.getElementById('sub-current');
    if (subCurrentInput) {
        const subGoalInput = document.getElementById('sub-goal');
        const subDisplay = document.getElementById('subcounter-display');
        const subCurrentView = document.getElementById('subcounter-current-view');
        const subBarFill = document.getElementById('subcounter-bar-fill');
        const subRemainingWrap = document.getElementById('subcounter-remaining');
        const subRemainingNum = document.getElementById('subcounter-remaining-num');

        const updateSubCounter = () => {
            const current = Math.max(0, parseInt(subCurrentInput.value, 10) || 0);
            const goal = Math.max(1, parseInt(subGoalInput.value, 10) || 1);
            const remaining = goal - current;
            const percent = Math.min(100, Math.max(0, (current / goal) * 100));

            subCurrentView.innerHTML = `${current.toLocaleString()}<span>人</span>`;
            subBarFill.style.width = `${percent}%`;

            if (remaining <= 0) {
                subRemainingWrap.innerHTML = '🎉 目標達成！';
            } else {
                subRemainingNum.textContent = remaining.toLocaleString();
                subRemainingWrap.innerHTML = `あと <strong id="subcounter-remaining-num">${remaining.toLocaleString()}</strong> 人で目標達成！`;
            }
        };

        subCurrentInput.addEventListener('input', updateSubCounter);
        subGoalInput.addEventListener('input', updateSubCounter);

        document.querySelectorAll('#subcounter-color-selector .btn-select').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#subcounter-color-selector .btn-select').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                subDisplay.setAttribute('data-color', btn.getAttribute('data-value'));
            });
        });

        updateSubCounter();
    }

    /* --- 11. TOOLS：BPMタップカウンター --- */
    const bpmTapBtn = document.getElementById('bpm-tap-btn');
    if (bpmTapBtn) {
        const bpmValueEl = document.getElementById('bpm-value');
        const bpmScreen = document.getElementById('bpm-screen');
        let tapTimes = [];
        let bpmResetTimer = null;

        const registerTap = () => {
            const now = Date.now();
            tapTimes.push(now);
            if (tapTimes.length > 8) tapTimes.shift();

            if (tapTimes.length >= 2) {
                const intervals = [];
                for (let i = 1; i < tapTimes.length; i++) intervals.push(tapTimes[i] - tapTimes[i - 1]);
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const bpm = Math.round(60000 / avgInterval);
                bpmValueEl.textContent = String(Math.min(bpm, 999)).padStart(3, '0');
            }

            clearTimeout(bpmResetTimer);
            bpmResetTimer = setTimeout(() => {
                tapTimes = [];
                bpmValueEl.textContent = '000';
            }, 5000);
        };

        bpmTapBtn.addEventListener('click', registerTap);

        document.addEventListener('keydown', (e) => {
            if (e.code !== 'Space') return;
            const tag = document.activeElement ? document.activeElement.tagName : '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;
            const bpmPanel = document.getElementById('bpm-counter');
            if (!bpmPanel || !bpmPanel.classList.contains('active')) return;
            e.preventDefault();
            registerTap();
        });

        document.querySelectorAll('#bpm-color-selector .btn-select').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#bpm-color-selector .btn-select').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                bpmScreen.setAttribute('data-color', btn.getAttribute('data-value'));
            });
        });
    }
});