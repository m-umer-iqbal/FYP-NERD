// == Content Script for Form Saver (Theme: #021A54, #FF85BB, #FFCEE3, #F5F5F5) ==
// Uses chrome.storage.local to sync with the extension popup.
// IMPORTANT: This script must be injected with "storage" permission.

(function () {
    'use strict';

    // ---------- CONFIGURATION ----------
    const STORAGE_KEY = 'formSaver_collections';
    const BUTTON_ID = 'ext-form-saver-btn';
    const MODAL_CONTAINER_ID = 'ext-form-saver-modal';

    // Theme colors
    const COLORS = {
        primary: '#021A54',      // Deep navy
        accent: '#FF85BB',       // Soft pink
        lightPink: '#FFCEE3',    // Light pink background
        lightGray: '#F5F5F5'     // Off-white
    };

    // ---------- CHROME STORAGE HELPERS (Promise‑based) ----------
    function getCollections() {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                const collections = result[STORAGE_KEY] || [];
                resolve(collections);
            });
        });
    }

    function saveCollections(collections) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEY]: collections }, resolve);
        });
    }

    async function createCollection(name) {
        const collections = await getCollections();
        const newCollection = {
            id: Date.now(),
            name: name,
            forms: 0,
            objects: []
        };
        collections.push(newCollection);
        await saveCollections(collections);
        return newCollection;
    }

    async function getCollectionObjects(collectionId) {
        const collections = await getCollections();
        const collection = collections.find(c => c.id === collectionId);
        return collection ? collection.objects || [] : [];
    }

    async function getObjectData(collectionId, objectId) {
        const collections = await getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (collection && collection.objects) {
            const obj = collection.objects.find(o => o.id === objectId);
            return obj ? obj.data : null;
        }
        return null;
    }

    async function saveFormToCollection(collectionId, objectName, data) {
        const collections = await getCollections();
        const collection = collections.find(c => c.id === collectionId);
        if (collection) {
            if (!collection.objects) collection.objects = [];
            collection.objects.push({
                id: Date.now(),
                name: objectName,
                data: data,
                savedAt: new Date().toISOString()
            });
            collection.forms = collection.objects.length; // correct count
            await saveCollections(collections);
        }
    }

    // ---------- PAGE TYPE DETECTION ----------
    function isSignupPage() {
        const url = window.location.href.toLowerCase();
        const signupKeywords = ['signup', 'register', 'join', 'create-account', 'sign-up'];
        const hasSignupKeyword = signupKeywords.some(kw => url.includes(kw));

        const passwordFields = document.querySelectorAll('input[type="password"]');
        const confirmPasswordExists = Array.from(passwordFields).some(field => {
            const id = (field.id || '').toLowerCase();
            const name = (field.name || '').toLowerCase();
            const placeholder = (field.placeholder || '').toLowerCase();
            return id.includes('confirm') || name.includes('confirm') || placeholder.includes('confirm');
        });

        return hasSignupKeyword || (passwordFields.length >= 2 && confirmPasswordExists);
    }

    function isSigninPage() {
        const url = window.location.href.toLowerCase();
        const signinKeywords = ['signin', 'login', 'log-in', 'sign-in', 'auth'];
        const hasSigninKeyword = signinKeywords.some(kw => url.includes(kw));

        const passwordFields = document.querySelectorAll('input[type="password"]');
        const confirmPasswordExists = Array.from(passwordFields).some(field => {
            const id = (field.id || '').toLowerCase();
            const name = (field.name || '').toLowerCase();
            const placeholder = (field.placeholder || '').toLowerCase();
            return id.includes('confirm') || name.includes('confirm') || placeholder.includes('confirm');
        });

        return hasSigninKeyword || (passwordFields.length >= 1 && !confirmPasswordExists);
    }

    // ---------- FORM DATA EXTRACTION ----------
    function extractFormData() {
        const form = document.querySelector('form');
        if (!form) return {};

        const inputs = form.querySelectorAll('input, select, textarea');
        const data = {};
        inputs.forEach(input => {
            if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;
            const key = input.name || input.id || input.placeholder || `field_${Math.random()}`;
            if (input.type === 'checkbox' || input.type === 'radio') {
                data[key] = input.checked;
            } else {
                data[key] = input.value;
            }
        });
        return data;
    }

    // ---------- UI: Floating Button with SVG Icon ----------
    function createFloatingButton(text, onClick, disabled = false) {
        const existing = document.getElementById(BUTTON_ID);
        if (existing) existing.remove();

        const btn = document.createElement('button');
        btn.id = BUTTON_ID;
        btn.disabled = disabled;

        const iconSvg = text.toLowerCase().includes('save')
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM15 9H5V5H15V9Z" fill="currentColor"/>
         </svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M7.5 5.5L9 2L10.5 5.5L14 7L10.5 8.5L9 12L7.5 8.5L4 7L7.5 5.5Z" fill="currentColor"/>
           <path d="M19 11L17.5 14.5L14 16L17.5 17.5L19 21L20.5 17.5L24 16L20.5 14.5L19 11Z" fill="currentColor"/>
           <path d="M5 21L7 15L9 21H5Z" fill="currentColor"/>
         </svg>`;

        btn.innerHTML = `
      <span style="display:flex; align-items:center; gap:8px;">
        ${iconSvg}
        <span>${text}</span>
      </span>
    `;

        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '999999',
            padding: '10px 18px',
            backgroundColor: disabled ? '#A0A0A0' : COLORS.accent,
            color: disabled ? '#E0E0E0' : COLORS.primary,
            border: 'none',
            borderRadius: '40px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 15px rgba(2, 26, 84, 0.2)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            pointerEvents: 'auto',
            border: `1px solid ${COLORS.primary}20`
        });

        if (!disabled) {
            btn.addEventListener('mouseenter', () => {
                btn.style.backgroundColor = COLORS.lightPink;
                btn.style.boxShadow = '0 6px 18px rgba(2, 26, 84, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.backgroundColor = COLORS.accent;
                btn.style.boxShadow = '0 4px 15px rgba(2, 26, 84, 0.2)';
            });
        }

        btn.addEventListener('click', onClick);
        document.body.appendChild(btn);
        return btn;
    }

    function removeFloatingButton() {
        const btn = document.getElementById(BUTTON_ID);
        if (btn) btn.remove();
    }

    // ---------- UI: Collection Selection Modal (Themed) ----------
    async function showCollectionModal(options) {
        const { mode, formData, onConfirm, onCancel } = options;
        const existing = document.getElementById(MODAL_CONTAINER_ID);
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = MODAL_CONTAINER_ID;
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: '1000000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        const modal = document.createElement('div');
        Object.assign(modal.style, {
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '20px',
            width: '400px',
            maxHeight: '80%',
            overflowY: 'auto',
            boxShadow: `0 20px 40px ${COLORS.primary}30`,
            border: `1px solid ${COLORS.lightPink}`
        });

        modal.innerHTML = '<p style="color:' + COLORS.primary + ';">Loading collections...</p>';
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const collections = await getCollections();

        if (mode === 'save') {
            renderSaveModal(modal, collections, formData, onConfirm, onCancel);
        } else if (mode === 'autofill') {
            renderAutofillModal(modal, collections, onConfirm, onCancel);
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                if (onCancel) onCancel();
            }
        });
    }

    function renderSaveModal(modal, collections, formData, onConfirm, onCancel) {
        const noCollections = collections.length === 0;

        modal.innerHTML = `
      <h3 style="margin:0 0 16px; color:${COLORS.primary};">Save Form Data</h3>
      ${noCollections ? `
        <p style="margin:0 0 16px; color:${COLORS.primary};">You don't have any collections yet. Create one to save this form.</p>
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          <input type="text" id="ext-new-collection-name" placeholder="Collection name" style="flex:1; padding:10px; border:1px solid ${COLORS.lightPink}; border-radius:12px; font-size:14px;">
          <button id="ext-create-first-collection" style="padding:10px 16px; background:${COLORS.accent}; color:${COLORS.primary}; border:none; border-radius:12px; font-weight:600; cursor:pointer;">Create</button>
        </div>
      ` : `
        <p style="margin:0 0 12px; color:${COLORS.primary};">Choose a collection:</p>
        <select id="ext-collection-select" style="width:100%; padding:10px; border:1px solid ${COLORS.lightPink}; border-radius:12px; margin-bottom:16px; font-size:14px; background:${COLORS.lightGray};">
          ${collections.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
        <div style="display:flex; gap:8px; margin-bottom:16px;">
          <input type="text" id="ext-new-collection-name" placeholder="New collection name" style="flex:1; padding:10px; border:1px solid ${COLORS.lightPink}; border-radius:12px; font-size:14px;">
          <button id="ext-create-collection-btn" style="padding:10px 16px; background:${COLORS.accent}; color:${COLORS.primary}; border:none; border-radius:12px; font-weight:600; cursor:pointer;">Create</button>
        </div>
      `}
      <label style="display:block; margin-bottom:20px; color:${COLORS.primary};">
        Entry name (optional):
        <input type="text" id="ext-object-name" placeholder="e.g., Personal Account" style="width:100%; padding:10px; border:1px solid ${COLORS.lightPink}; border-radius:12px; margin-top:4px;">
      </label>
      <div style="display:flex; justify-content:flex-end; gap:12px;">
        <button id="ext-cancel-save" style="padding:10px 20px; background:transparent; border:1px solid ${COLORS.primary}; color:${COLORS.primary}; border-radius:30px; cursor:pointer;">Cancel</button>
        <button id="ext-confirm-save" style="padding:10px 24px; background:${COLORS.primary}; color:white; border:none; border-radius:30px; font-weight:600; cursor:pointer;" ${noCollections ? 'disabled' : ''}>Save</button>
      </div>
    `;

        const selectEl = noCollections ? null : modal.querySelector('#ext-collection-select');
        const newNameInput = modal.querySelector('#ext-new-collection-name');
        const createBtn = noCollections ? modal.querySelector('#ext-create-first-collection') : modal.querySelector('#ext-create-collection-btn');
        const objectNameInput = modal.querySelector('#ext-object-name');
        const cancelBtn = modal.querySelector('#ext-cancel-save');
        const confirmBtn = modal.querySelector('#ext-confirm-save');

        const createNewCollection = async () => {
            const newName = newNameInput.value.trim();
            if (!newName) {
                alert('Please enter a collection name');
                return;
            }
            const newCollection = await createCollection(newName);
            const updatedCollections = await getCollections();
            if (selectEl) {
                selectEl.innerHTML = updatedCollections.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                selectEl.value = newCollection.id;
            } else {
                // No collections before, now we have one – re-render the whole modal
                renderSaveModal(modal, updatedCollections, formData, onConfirm, onCancel);
            }
            newNameInput.value = '';
            if (confirmBtn) confirmBtn.disabled = false;
        };

        createBtn.addEventListener('click', createNewCollection);
        newNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') createNewCollection();
        });

        cancelBtn.addEventListener('click', () => {
            modal.parentElement.remove();
            if (onCancel) onCancel();
        });

        confirmBtn.addEventListener('click', async () => {
            if (noCollections) return;
            const collectionId = selectEl ? parseInt(selectEl.value) : null;
            if (!collectionId) return;
            const objectName = objectNameInput.value.trim() || `Entry ${new Date().toLocaleString()}`;
            const dataToSave = {
                ...formData,
                _meta: { savedAt: new Date().toISOString(), url: window.location.href }
            };
            await saveFormToCollection(collectionId, objectName, dataToSave);
            modal.parentElement.remove();
            if (onConfirm) onConfirm();
        });
    }

    function renderAutofillModal(modal, collections, onConfirm, onCancel) {
        if (collections.length === 0) {
            modal.innerHTML = `
                <h3 style="margin:0 0 16px; color:${COLORS.primary};">No Collections Found</h3>
                <p style="margin:0 0 20px; color:${COLORS.primary};">You haven't saved any form data yet.</p>
                <div style="display:flex; justify-content:flex-end;">
                    <button id="ext-cancel-autofill" style="padding:10px 20px; background:transparent; border:1px solid ${COLORS.primary}; color:${COLORS.primary}; border-radius:30px; cursor:pointer;">Close</button>
                </div>
            `;
            modal.querySelector('#ext-cancel-autofill').addEventListener('click', () => {
                modal.parentElement.remove();
                if (onCancel) onCancel();
            });
            return;
        }

        modal.innerHTML = `
      <h3 style="margin:0 0 16px; color:${COLORS.primary};">Autofill Sign‑in</h3>
      <p style="margin:0 0 12px; color:${COLORS.primary};">Select a collection:</p>
      <select id="ext-autofill-collection" style="width:100%; padding:10px; border:1px solid ${COLORS.lightPink}; border-radius:12px; margin-bottom:16px; background:${COLORS.lightGray};">
        ${collections.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      </select>
      <p style="margin:0 0 12px; color:${COLORS.primary};">Select an entry:</p>
      <select id="ext-autofill-object" style="width:100%; padding:10px; border:1px solid ${COLORS.lightPink}; border-radius:12px; margin-bottom:24px; background:${COLORS.lightGray};" disabled>
        <option>-- Select collection first --</option>
      </select>
      <div style="display:flex; justify-content:flex-end; gap:12px;">
        <button id="ext-cancel-autofill" style="padding:10px 20px; background:transparent; border:1px solid ${COLORS.primary}; color:${COLORS.primary}; border-radius:30px; cursor:pointer;">Cancel</button>
        <button id="ext-confirm-autofill" style="padding:10px 24px; background:${COLORS.primary}; color:white; border:none; border-radius:30px; font-weight:600; cursor:pointer;">Fill</button>
      </div>
    `;

        const collectionSelect = modal.querySelector('#ext-autofill-collection');
        const objectSelect = modal.querySelector('#ext-autofill-object');
        const cancelBtn = modal.querySelector('#ext-cancel-autofill');
        const confirmBtn = modal.querySelector('#ext-confirm-autofill');

        const updateObjectSelect = async () => {
            const collectionId = parseInt(collectionSelect.value);
            const objects = await getCollectionObjects(collectionId);
            if (objects.length === 0) {
                objectSelect.innerHTML = '<option>No entries in this collection</option>';
                objectSelect.disabled = true;
                confirmBtn.disabled = true;
            } else {
                objectSelect.innerHTML = objects.map(obj => `<option value="${obj.id}">${obj.name}</option>`).join('');
                objectSelect.disabled = false;
                confirmBtn.disabled = false;
            }
        };

        collectionSelect.addEventListener('change', updateObjectSelect);
        updateObjectSelect(); // initial load

        cancelBtn.addEventListener('click', () => {
            modal.parentElement.remove();
            if (onCancel) onCancel();
        });

        confirmBtn.addEventListener('click', async () => {
            const collectionId = parseInt(collectionSelect.value);
            const objectId = parseInt(objectSelect.value);
            if (!objectId) return;
            const data = await getObjectData(collectionId, objectId);
            if (data) {
                autofillFields(data);
            }
            modal.parentElement.remove();
            if (onConfirm) onConfirm();
        });
    }

    // ---------- AUTOFILL LOGIC (Improved matching) ----------
    function autofillFields(data) {
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');

        const synonyms = {
            'email': ['email', 'e-mail', 'user', 'username', 'login', 'account'],
            'password': ['password', 'pass', 'pwd'],
            'firstname': ['firstname', 'first', 'fname', 'givenname'],
            'lastname': ['lastname', 'last', 'lname', 'surname', 'familyname'],
            'phone': ['phone', 'mobile', 'tel', 'telephone', 'contact'],
            'address': ['address', 'street', 'addr'],
            'city': ['city', 'town'],
            'state': ['state', 'province', 'region'],
            'zip': ['zip', 'postal', 'postcode', 'pincode'],
        };

        Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith('_meta')) return;
            if (value === undefined || value === null) return;

            const keyLower = key.toLowerCase();
            let possibleNames = [keyLower];
            for (const [base, syns] of Object.entries(synonyms)) {
                if (keyLower.includes(base) || syns.some(s => keyLower.includes(s))) {
                    possibleNames.push(...syns);
                }
            }
            possibleNames.push(keyLower.replace(/[_\-\s]*(name|field|input)$/, ''));

            let matched = false;
            for (const input of inputs) {
                const name = (input.name || '').toLowerCase();
                const id = (input.id || '').toLowerCase();
                const placeholder = (input.placeholder || '').toLowerCase();
                const label = findLabelText(input).toLowerCase();
                const type = input.type || '';

                const matches = possibleNames.some(term =>
                    name.includes(term) || id.includes(term) || placeholder.includes(term) || label.includes(term)
                );

                if (!matches) {
                    if ((type === 'email' && possibleNames.includes('email')) ||
                        (type === 'password' && possibleNames.includes('password'))) {
                        // continue
                    } else {
                        continue;
                    }
                }

                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = (typeof value === 'boolean') ? value : (value === 'true' || value === true);
                } else {
                    input.value = value;
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                matched = true;
                break;
            }

            if (!matched) {
                if (keyLower.includes('email') || keyLower === 'username') {
                    const emailInput = Array.from(inputs).find(i => i.type === 'email' || i.name === 'username' || i.id === 'username');
                    if (emailInput) {
                        emailInput.value = value;
                        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } else if (keyLower.includes('password')) {
                    const passInput = Array.from(inputs).find(i => i.type === 'password');
                    if (passInput) {
                        passInput.value = value;
                        passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }
        });
    }

    function findLabelText(input) {
        if (input.labels && input.labels.length > 0) return input.labels[0].textContent;
        const id = input.id;
        if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) return label.textContent;
        }
        return '';
    }

    // ---------- SIGN‑UP PAGE LOGIC ----------
    function setupSignupPage() {
        createFloatingButton('Save Form', () => {
            const formData = extractFormData();
            showCollectionModal({
                mode: 'save',
                formData,
                onConfirm: () => { },
                onCancel: () => { }
            });
        }, false);
    }

    // ---------- SIGN‑IN PAGE LOGIC ----------
    function setupSigninPage() {
        createFloatingButton('Autofill', () => {
            showCollectionModal({
                mode: 'autofill',
                onConfirm: () => { },
                onCancel: () => { }
            });
        }, false);
    }

    // ---------- INITIALIZATION ----------
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        if (isSignupPage()) {
            setupSignupPage();
        } else if (isSigninPage()) {
            setupSigninPage();
        }
    }

    init();
})();