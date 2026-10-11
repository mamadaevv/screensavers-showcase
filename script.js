// Environment Type Detection Function
function getEnvironmentType() {
    const hostname = location.hostname;
    const protocol = location.protocol;

    // Local Environments
    if (protocol === 'file:' ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        (hostname.startsWith('172.') && parseInt(hostname.split('.')[1]) >= 16 && parseInt(hostname.split('.')[1]) <= 31)) {
        return 'local';
    }

    // We consider everything else to be production
    return 'production';
}

// Registering a Service Worker for a PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const environment = getEnvironmentType();
        const swPath = environment === 'local' ? '/sw.js' : '/sw.prod.js';

        navigator.serviceWorker.register(swPath)
            .then(registration => {
                // The Service Worker was registered successfully
            })
            .catch(error => {
            });
    });
}

// PWA Setup Processing
window.addEventListener('beforeinstallprompt', (e) => {
    // We do not prevent the prompt from appearing; we allow the browser to display the button in the address bar
});

window.addEventListener('appinstalled', (evt) => {
    // The PWA has been successfully installed
});

// Retrieving elements
const drawer = document.querySelector('.drawer-placement-start');
const mainContainer = document.querySelector('main');

// Click handler to open the drawer
mainContainer.addEventListener('click', () => {
    drawer.show();
});

// Drawer close event handler (optional)
drawer.addEventListener('sl-after-hide', () => {
    // The drawer is closed
});

// Handler for the full-screen mode button in the header drawer
document.addEventListener('click', (e) => {
    if (e.target.closest('.fullscreen-button')) {
        toggleFullscreen();
    }
});

// Full-Screen Mode Toggle Feature
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
        });
    } else {
        document.exitFullscreen().catch(err => {
        });
    }
}

// We get a drop-down menu for selecting a screensaver
const screensaverSelect = document.querySelector('sl-select');

// Functions for adjusting brightness settings
function getBrightnessSetting() {
    const saved = localStorage.getItem('brightness-value');
    return saved !== null ? parseInt(saved) : 0;
}

function saveBrightnessSetting(value) {
    localStorage.setItem('brightness-value', value);
}

function getBrightnessSwitchSetting() {
    const saved = localStorage.getItem('brightness-switch-enabled');
    return saved !== null ? saved === 'true' : false; // Disabled by default
}

function saveBrightnessSwitchSetting(enabled) {
    localStorage.setItem('brightness-switch-enabled', enabled);
}


// Brightness Adjustment Feature
function updateBrightness() {
    const brightnessSwitch = document.getElementById('brightness-switch');
    const screensaverContainer = document.getElementById('screensaver-container');
    const body = document.body;

    if (!brightnessSwitch || !screensaverContainer) {
        return;
    }

    const isEnabled = brightnessSwitch.checked;
    const brightness = getBrightnessSetting();

    // Show/Hide Brightness Controls
    const brightnessContainer = document.getElementById('brightness-settings');
    if (brightnessContainer) {
        const controls = brightnessContainer.querySelectorAll('sl-range, sl-input');
        controls.forEach(control => {
            control.style.display = isEnabled ? '' : 'none';
        });
    }

    if (isEnabled) {
        // Applying Brightness - Inverted Transparency
        const opacity = (100 - Math.abs(brightness)) / 100; // From 1 to 0
        screensaverContainer.style.opacity = opacity;

        // Change the background color of the body
        if (brightness < 0) {
            body.style.backgroundColor = 'black';
        } else if (brightness > 0) {
            body.style.backgroundColor = 'white';
        } else {
            body.style.backgroundColor = '';
        }
    } else {
        // Do not apply brightness—reset the styles
        screensaverContainer.style.opacity = '';
        body.style.backgroundColor = '';
    }
}


// Function for Adding Global Transformation Settings
function addTransformControl(container) {

    // Rotation Settings
    const rotationDiv = document.createElement('div');

    const rotationLabel = document.createElement('label');
    rotationLabel.textContent = 'Rotation (°)';
    rotationLabel.style.display = 'block';
    rotationLabel.style.fontSize = 'var(--sl-input-label-font-size-small)';
    rotationLabel.style.fontWeight = 'var(--sl-input-label-font-weight)';
    rotationLabel.style.color = 'var(--sl-input-label-color)';

    const rotationRange = document.createElement('sl-range');
    rotationRange.style.setProperty('--thumb-size', '12px');
    rotationRange.min = -180;
    rotationRange.max = 180;
    rotationRange.step = 1;
    rotationRange.value = getRotationSetting();

    const rotationInput = document.createElement('sl-input');
    rotationInput.type = 'number';
    rotationInput.min = -180;
    rotationInput.max = 180;
    rotationInput.step = 1;
    rotationInput.value = rotationRange.value;
    rotationInput.size = 'small';
    rotationInput.style.marginLeft = 'var(--sl-spacing-small)';

    // Synchronize values between `range` and `input`
    rotationRange.addEventListener('input', (e) => {
        rotationInput.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationRange.addEventListener('sl-input', (e) => {
        rotationInput.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationInput.addEventListener('input', (e) => {
        rotationRange.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationInput.addEventListener('sl-input', (e) => {
        rotationRange.value = e.target.value;
        saveRotationSetting(e.target.value);
        updateTransform();
    });

    rotationDiv.appendChild(rotationLabel);
    rotationDiv.appendChild(rotationRange);
    rotationDiv.appendChild(rotationInput);

    // Scale Settings
    const scaleDiv = document.createElement('div');

    const scaleLabel = document.createElement('label');
    scaleLabel.textContent = 'Scale';
    scaleLabel.style.display = 'block';
    scaleLabel.style.fontSize = 'var(--sl-input-label-font-size-small)';
    scaleLabel.style.fontWeight = 'var(--sl-input-label-font-weight)';
    scaleLabel.style.color = 'var(--sl-input-label-color)';

    const scaleRange = document.createElement('sl-range');
    scaleRange.style.setProperty('--thumb-size', '12px');
    scaleRange.min = 0.1;
    scaleRange.max = 3.0;
    scaleRange.step = 0.1;
    scaleRange.value = getScaleSetting();

    const scaleInput = document.createElement('sl-input');
    scaleInput.type = 'number';
    scaleInput.min = 0.1;
    scaleInput.max = 3.0;
    scaleInput.step = 0.1;
    scaleInput.value = scaleRange.value;
    scaleInput.size = 'small';
    scaleInput.style.marginLeft = 'var(--sl-spacing-small)';

    // Synchronize values between `range` and `input`
    scaleRange.addEventListener('input', (e) => {
        scaleInput.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleRange.addEventListener('sl-input', (e) => {
        scaleInput.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleInput.addEventListener('input', (e) => {
        scaleRange.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleInput.addEventListener('sl-input', (e) => {
        scaleRange.value = e.target.value;
        saveScaleSetting(e.target.value);
        updateTransform();
    });

    scaleDiv.appendChild(scaleLabel);
    scaleDiv.appendChild(scaleRange);
    scaleDiv.appendChild(scaleInput);

    container.appendChild(rotationDiv);
    container.appendChild(scaleDiv);
}

// Function to Add a Global Brightness Setting
function addBrightnessControl(container) {
    const brightnessDiv = document.createElement('div');

    // Let's create a container for the header and the switch
    const headerDiv = document.createElement('div');
    headerDiv.style.display = 'flex';
    headerDiv.style.alignItems = 'center';
    headerDiv.style.justifyContent = 'space-between';

    // Creating a Label
    const label = document.createElement('label');
    label.textContent = 'Brightness';
    label.style.display = 'block';
    label.style.fontSize = 'var(--sl-input-label-font-size-small)';
    label.style.fontWeight = 'var(--sl-input-label-font-weight)';
    label.style.color = 'var(--sl-input-label-color)';

    // Creating a Switch Without a Label
    const brightnessSwitch = document.createElement('sl-switch');
    brightnessSwitch.id = 'brightness-switch';
    brightnessSwitch.size = 'small';
    brightnessSwitch.checked = getBrightnessSwitchSetting();

    // Brightness Switch Change Handler
    brightnessSwitch.addEventListener('sl-change', (event) => {
        const isEnabled = event.target.checked;
        saveBrightnessSwitchSetting(isEnabled);
        updateBrightness();
    });

    headerDiv.appendChild(label);
    headerDiv.appendChild(brightnessSwitch);

    // Creating an sl-range with a custom track offset
    const range = document.createElement('sl-range');
    range.style.setProperty('--thumb-size', '12px');
    range.min = -100;
    range.max = 100;
    range.step = 1;
    range.value = getBrightnessSetting();
    range.style.setProperty('--track-active-offset', '50%');

    // Let's create an `sl-input` for numeric input
    const input = document.createElement('sl-input');
    input.size = 'small';
    input.type = 'number';
    input.min = -100;
    input.max = 100;
    input.step = 1;
    input.value = range.value;

    // Synchronize values between `range` and `input` in real time
    range.addEventListener('input', (e) => {
        input.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    range.addEventListener('sl-input', (e) => {
        input.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    input.addEventListener('input', (e) => {
        range.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    input.addEventListener('sl-input', (e) => {
        range.value = e.target.value;
        saveBrightnessSetting(e.target.value);
        updateBrightness();
    });

    brightnessDiv.appendChild(headerDiv);
    brightnessDiv.appendChild(input);
    brightnessDiv.appendChild(range);
    container.appendChild(brightnessDiv);
}

// Function for Creating Settings Controls
function createSettingsControls(componentClass, container) {
  // Make the function global so it can be accessed from components
  window.createSettingsControls = createSettingsControls;
    // Cleaning the container
    container.innerHTML = '';

    // Retrieve settings from the component
    const settings = componentClass.getSettings();

    // Calculate the component's tag name (using the same format as in `switchScreensaver`)
    const componentName = componentClass.name.replace('Screensaver', '');
    const componentTagName = componentName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') + '-screensaver';

    // Checking the animation status
    const isAnimationEnabled = getSavedSetting(componentTagName, 'animationEnabled', 'true') === 'true';
    console.log(`[Debugging] Configuring settings for ${componentTagName}, animation: ${isAnimationEnabled ? 'ON' : 'OFF'}`);

    // A function to check whether a setting should be disabled
    const shouldDisableSetting = (settingName) => {
        if (isAnimationEnabled) return false;

        // Settings that are disabled when animations are turned off
        const animationSettings = {
            'linear-gradient-screensaver': ['speedPresets', 'updateInterval', 'updateStep'],
            'conic-gradient-screensaver': ['speed'],
            'color-transition-screensaver': ['speed']
        };

        const shouldDisable = animationSettings[componentTagName]?.includes(settingName) || false;
        if (shouldDisable) {
            console.log(`[Debugging] Disabling setting ${settingName} for ${componentTagName} (animation disabled)`);
        }
        return shouldDisable;
    };

    // Group settings by type
    const rangeSettings = settings.filter(setting => setting.type === 'range');
    const colorSettings = settings.filter(setting => setting.type === 'color');
    const radioSettings = settings.filter(setting => setting.type === 'radio');
    const buttonGroupSettings = settings.filter(setting => setting.type === 'button-group');
    const switchSettings = settings.filter(setting => setting.type === 'switch');
    const positionCenterSettings = settings.filter(setting => setting.type === 'position-center');

    // Creating controls for the settings switch (at the beginning)
    switchSettings.forEach(setting => {
        const switchDiv = document.createElement('div');

        // Let's create a container for the header and the switch
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.justifyContent = 'space-between';

        // Creating a Label
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.fontSize = 'var(--sl-input-label-font-size-small)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        // Let's create a switch
        const switchElement = document.createElement('sl-switch');
        switchElement.size = 'small';
        const savedValue = getSavedSetting(componentTagName, setting.name, setting.default);
        // Convert a string to a boolean
        const checkedValue = savedValue === 'true' || savedValue === true;
        switchElement.checked = checkedValue;
        console.log(`[Debugging] Creating a switch ${setting.name} for ${componentTagName}, value from localStorage: ${savedValue}, checked: ${checkedValue}`);

        // Force a refresh of the switch's status
        requestAnimationFrame(() => {
            switchElement.checked = checkedValue;
        });

        // Switch change handler
        switchElement.addEventListener('sl-change', (event) => {
            const isChecked = event.target.checked;
            console.log(`[Debugging] Switch ${setting.name} changed to ${isChecked ? 'ON' : 'OFF'} for ${componentTagName}, saving to localStorage`);
            saveSetting(componentTagName, setting.name, isChecked.toString()); // Save as a string

            // Special handling for `animationEnabled`
            if (setting.name === 'animationEnabled') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateAnimationEnabled === 'function') {
                    currentElement.updateAnimationEnabled(isChecked);
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        headerDiv.appendChild(label);
        headerDiv.appendChild(switchElement);

        switchDiv.appendChild(headerDiv);
        container.appendChild(switchDiv);
    });

    // Special processing for solid colors (inline color picker)
    if (componentTagName === 'solid-color-screensaver' && colorSettings.length === 1) {
        const setting = colorSettings[0];
        const colorDiv = document.createElement('div');

        // Creating a Label
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.fontSize = 'var(--sl-input-label-font-size-small)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        // Creating an inline color picker
        const colorPicker = document.createElement('sl-color-picker');
        colorPicker.value = getSavedSetting(componentTagName, setting.name, setting.default);
        colorPicker.inline = true; // Let's use inline mode
        colorPicker.swatches = '#ff0000;#ff8000;#ffff00;#80ff00;#00ff80;#0080ff;#8000ff;#ffffff;#c0c0c0;#808080;#404040;#000000';

        colorPicker.addEventListener('sl-input', (e) => {
            const newHex = e.target.value;
            const currentElement = document.querySelector(`${componentTagName}`);
            if (currentElement && typeof currentElement.updateColor === 'function') {
                currentElement.updateColor(newHex);
            }
        });

        colorDiv.appendChild(label);
        colorDiv.appendChild(colorPicker);
        container.appendChild(colorDiv);
        return; // No other settings are needed for solid-color
    }

    // Creating controls for the settings range
    rangeSettings.forEach(setting => {
        const settingDiv = document.createElement('div');

        // Creating a Label
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.fontSize = 'var(--sl-input-label-font-size-small)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        // Create an sl-range without a label
        const range = document.createElement('sl-range');
        range.style.setProperty('--thumb-size', '12px');
        range.min = setting.min;
        range.max = setting.max;
        range.step = setting.step;
        range.value = getSavedSetting(componentTagName, setting.name, setting.default);

        // Create an `sl-input` for numeric input without a label
        const input = document.createElement('sl-input');
        input.type = 'number';
        input.min = setting.min;
        input.max = setting.max;
        input.step = setting.step;
        input.value = range.value;
        input.size = 'small';

        // Hide the controls if the setting is disabled
        const isDisabled = setting.disabled || shouldDisableSetting(setting.name);
        if (isDisabled) {
            range.disabled = true;
            input.disabled = true;
            range.style.opacity = '0.5';
            input.style.opacity = '0.5';
        }

        // Synchronize values between `range` and `input` in real time
        range.addEventListener('input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Special processing for component settings
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else if (setting.name === 'backgroundSize' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateBackgroundSize === 'function') {
                    currentElement.updateBackgroundSize(e.target.value);
                }
            } else if (setting.name === 'updateInterval' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateInterval === 'function') {
                    currentElement.updateUpdateInterval(e.target.value);
                }
            } else if (setting.name === 'updateStep' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateStep === 'function') {
                    currentElement.updateUpdateStep(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else if (setting.name === 'offsetX' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetX === 'function') {
                    currentElement.updateOffsetX(e.target.value);
                }
            } else if (setting.name === 'offsetY' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetY === 'function') {
                    currentElement.updateOffsetY(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'color-transition-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        range.addEventListener('sl-input', (e) => {
            input.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Special processing for component settings
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else if (setting.name === 'backgroundSize' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateBackgroundSize === 'function') {
                    currentElement.updateBackgroundSize(e.target.value);
                }
            } else if (setting.name === 'updateInterval' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateInterval === 'function') {
                    currentElement.updateUpdateInterval(e.target.value);
                }
            } else if (setting.name === 'updateStep' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateStep === 'function') {
                    currentElement.updateUpdateStep(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else if (setting.name === 'offsetX' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetX === 'function') {
                    currentElement.updateOffsetX(e.target.value);
                }
            } else if (setting.name === 'offsetY' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetY === 'function') {
                    currentElement.updateOffsetY(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'color-transition-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        input.addEventListener('input', (e) => {
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Special processing for component settings
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else if (setting.name === 'backgroundSize' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateBackgroundSize === 'function') {
                    currentElement.updateBackgroundSize(e.target.value);
                }
            } else if (setting.name === 'updateInterval' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateInterval === 'function') {
                    currentElement.updateUpdateInterval(e.target.value);
                }
            } else if (setting.name === 'updateStep' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateStep === 'function') {
                    currentElement.updateUpdateStep(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else if (setting.name === 'offsetX' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetX === 'function') {
                    currentElement.updateOffsetX(e.target.value);
                }
            } else if (setting.name === 'offsetY' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetY === 'function') {
                    currentElement.updateOffsetY(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'color-transition-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        input.addEventListener('sl-input', (e) => {
            range.value = e.target.value;
            saveSetting(componentTagName, setting.name, e.target.value);

            // Special processing for component settings
            if (setting.name === 'globalRotation' || setting.name === 'globalScale') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement) {
                    if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(e.target.value);
                    } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                        currentElement.updateGlobalScale(e.target.value);
                    }
                }
            } else if (setting.name === 'backgroundSize' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateBackgroundSize === 'function') {
                    currentElement.updateBackgroundSize(e.target.value);
                }
            } else if (setting.name === 'updateInterval' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateInterval === 'function') {
                    currentElement.updateUpdateInterval(e.target.value);
                }
            } else if (setting.name === 'updateStep' && componentTagName === 'linear-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateUpdateStep === 'function') {
                    currentElement.updateUpdateStep(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else if (setting.name === 'offsetX' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetX === 'function') {
                    currentElement.updateOffsetX(e.target.value);
                }
            } else if (setting.name === 'offsetY' && componentTagName === 'conic-gradient-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateOffsetY === 'function') {
                    currentElement.updateOffsetY(e.target.value);
                }
            } else if (setting.name === 'speed' && componentTagName === 'color-transition-screensaver') {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateSpeed === 'function') {
                    currentElement.updateSpeed(e.target.value);
                }
            } else {
                updateCurrentScreensaver();
            }
        });

        settingDiv.appendChild(label);
        settingDiv.appendChild(input);

        // Add a button group for `globalRotation` between the `input` and `range` elements
        if (setting.name === 'globalRotation') {
            // Let's create a button group
            const buttonGroup = document.createElement('sl-button-group');

            // Add button elements
            const presets = [-90, -45, 0, 45, 90, 180];
            presets.forEach(value => {
                const button = document.createElement('sl-button');
                button.textContent = value + '°';
                button.value = value;
                button.size = 'small';

                // Button Click Handler
                button.addEventListener('click', () => {
                    input.value = value;
                    range.value = value;
                    saveSetting(componentTagName, setting.name, value);

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateGlobalRotation === 'function') {
                        currentElement.updateGlobalRotation(value);
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }


        // Add a button group for `offsetX` in the conical gradient
        if (setting.name === 'offsetX' && componentTagName === 'conic-gradient-screensaver') {
            // Let's create a button group
            const buttonGroup = document.createElement('sl-button-group');

            // Add button elements
            const presets = [0, 50, 100];
            presets.forEach(value => {
                const button = document.createElement('sl-button');
                button.textContent = value + '%';
                button.value = value;
                button.size = 'small';

                // Button Click Handler
                button.addEventListener('click', () => {
                    input.value = value;
                    range.value = value;
                    saveSetting(componentTagName, setting.name, value);

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateOffsetX === 'function') {
                        currentElement.updateOffsetX(value);
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }

        // Add a button group for `offsetY` in the conical gradient
        if (setting.name === 'offsetY' && componentTagName === 'conic-gradient-screensaver') {
            // Let's create a button group
            const buttonGroup = document.createElement('sl-button-group');

            // Add button elements
            const presets = [0, 50, 100];
            presets.forEach(value => {
                const button = document.createElement('sl-button');
                button.textContent = value + '%';
                button.value = value;
                button.size = 'small';

                // Button Click Handler
                button.addEventListener('click', () => {
                    input.value = value;
                    range.value = value;
                    saveSetting(componentTagName, setting.name, value);

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateOffsetY === 'function') {
                        currentElement.updateOffsetY(value);
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }

        settingDiv.appendChild(range);
        container.appendChild(settingDiv);
    });

    // Creating controls for the "position-center" settings
    positionCenterSettings.forEach(setting => {
        const settingDiv = document.createElement('div');

        // Creating a Label
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.fontSize = 'var(--sl-input-label-font-size-small)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        settingDiv.appendChild(label);

        // Button Group Container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        buttonContainer.style.gap = '-1px'; // negative indentation to compensate for borders

        // Defining Positions and Icons
        const positions = [
            ['top-left', 'top-center', 'top-right'],
            ['middle-left', 'center', 'middle-right'],
            ['bottom-left', 'bottom-center', 'bottom-right']
        ];

        const icons = {
            'top-left': 'arrow-up-left',
            'top-center': 'arrow-up',
            'top-right': 'arrow-up-right',
            'middle-left': 'arrow-left',
            'center': 'dot',
            'middle-right': 'arrow-right',
            'bottom-left': 'arrow-down-left',
            'bottom-center': 'arrow-down',
            'bottom-right': 'arrow-down-right'
        };

        positions.forEach((row, rowIndex) => {
            const rowContainer = document.createElement('div');
            rowContainer.style.display = 'flex';
            rowContainer.style.gap = '0';

            // Add classes for CSS Parts to customize indentation
            if (rowIndex < 2) { // the first two lines
                rowContainer.classList.add('position-row-with-margin');
            }

            const buttonGroup = document.createElement('sl-button-group');
            buttonGroup.style.width = '100%';

            row.forEach((position, colIndex) => {
                const button = document.createElement('sl-button');
                button.value = position;
                button.size = 'small';
                button.style.flex = '1';

                // Adding Classes for CSS Parts Customization
                const isCorner = (rowIndex === 0 && colIndex === 0) || // top-left
                                (rowIndex === 0 && colIndex === 2) || // top-right
                                (rowIndex === 2 && colIndex === 0) || // bottom-left
                                (rowIndex === 2 && colIndex === 2);   // bottom-right

                const isEdgeCenter = (rowIndex === 0 && colIndex === 1) || // top-center
                                   (rowIndex === 1 && colIndex === 0) || // middle-left
                                   (rowIndex === 1 && colIndex === 2) || // middle-right
                                   (rowIndex === 2 && colIndex === 1);   // bottom-center

                if (isCorner) {
                    button.classList.add(`position-${position}`);
                } else if (isEdgeCenter || position === 'center') {
                    button.classList.add('position-no-radius');
                }

                // Set an icon instead of text
                const icon = document.createElement('sl-icon');
                icon.name = icons[position];
                icon.slot = 'prefix';
                button.appendChild(icon);

                // Convert the position to a percentage
                const positionToCoords = {
                    'top-left': { x: 0, y: 0 },
                    'top-center': { x: 50, y: 0 },
                    'top-right': { x: 100, y: 0 },
                    'middle-left': { x: 0, y: 50 },
                    'center': { x: 50, y: 50 },
                    'middle-right': { x: 100, y: 50 },
                    'bottom-left': { x: 0, y: 100 },
                    'bottom-center': { x: 50, y: 100 },
                    'bottom-right': { x: 100, y: 100 }
                };

                // Button Click Handler
                button.addEventListener('click', () => {
                    const coords = positionToCoords[position];

                    // Updating the component
                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement) {
                        if (typeof currentElement.updateOffsetX === 'function') {
                            currentElement.updateOffsetX(coords.x);
                        }
                        if (typeof currentElement.updateOffsetY === 'function') {
                            currentElement.updateOffsetY(coords.y);
                        }

                        // Updating Values in UI Sliders
                        // Find the offsetX and offsetY sliders
                        const allSettingDivs = container.querySelectorAll('#screensaver-settings > div');
                        let offsetXDiv, offsetYDiv;

                        for (let i = 0; i < allSettingDivs.length; i++) {
                            const div = allSettingDivs[i];
                            const inputs = div.querySelectorAll('sl-input');
                            const ranges = div.querySelectorAll('sl-range');

                            if (inputs.length > 0 && ranges.length > 0) {
                                const label = div.querySelector('label');
                                if (label && label.textContent.includes('X-axis offset')) {
                                    offsetXDiv = div;
                                } else if (label && label.textContent.includes('Y-Offset')) {
                                    offsetYDiv = div;
                                }
                            }
                        }

                        // Updating sliders and input fields
                        if (offsetXDiv) {
                            const offsetXInput = offsetXDiv.querySelector('sl-input');
                            const offsetXRange = offsetXDiv.querySelector('sl-range');
                            if (offsetXInput) offsetXInput.value = coords.x;
                            if (offsetXRange) offsetXRange.value = coords.x;
                        }

                        if (offsetYDiv) {
                            const offsetYInput = offsetYDiv.querySelector('sl-input');
                            const offsetYRange = offsetYDiv.querySelector('sl-range');
                            if (offsetYInput) offsetYInput.value = coords.y;
                            if (offsetYRange) offsetYRange.value = coords.y;
                        }
                    }
                });

                buttonGroup.appendChild(button);
            });

            rowContainer.appendChild(buttonGroup);
            buttonContainer.appendChild(rowContainer);
        });

        settingDiv.appendChild(buttonContainer);
        container.appendChild(settingDiv);
    });

    // Creating controls for the settings button group
    buttonGroupSettings.forEach(setting => {
        const settingDiv = document.createElement('div');

        // Creating a Label
        const label = document.createElement('label');
        label.textContent = setting.label;
        label.style.display = 'block';
        label.style.fontSize = 'var(--sl-input-label-font-size-small)';
        label.style.fontWeight = 'var(--sl-input-label-font-weight)';
        label.style.color = 'var(--sl-input-label-color)';

        settingDiv.appendChild(label);

        // Add a button group for speedPresets with a linear gradient
        if (setting.name === 'speedPresets' && componentTagName === 'linear-gradient-screensaver') {
            // Let's create a button group
            const buttonGroup = document.createElement('sl-button-group');

            // Check whether the setting should be disabled
            const isDisabled = shouldDisableSetting(setting.name);
            if (isDisabled) {
                buttonGroup.style.opacity = '0.5';
                buttonGroup.style.pointerEvents = 'none';
            }

            // Add button elements
            const presets = [
                { value: 'slow', label: 'Slowly', interval: 500, step: 1 },
                { value: 'normal', label: 'Normal', interval: 100, step: 1 },
                { value: 'fast', label: 'Quickly', interval: 10, step: 1 }
            ];
            presets.forEach(preset => {
                const button = document.createElement('sl-button');
                button.textContent = preset.label;
                button.value = preset.value;
                button.size = 'small';
                if (isDisabled) {
                    button.disabled = true;
                }

                // Button Click Handler
                button.addEventListener('click', () => {
                    // Set the period and step values
                    saveSetting(componentTagName, 'updateInterval', preset.interval);
                    saveSetting(componentTagName, 'updateStep', preset.step);

                    // Update the relevant controls
                    // Finding Elements by Their Position in the DOM
                    const allSettingDivs = container.querySelectorAll('#screensaver-settings > div');
                    let intervalDiv, stepDiv;

                    for (let i = 0; i < allSettingDivs.length; i++) {
                        const div = allSettingDivs[i];
                        const inputs = div.querySelectorAll('sl-input');
                        const ranges = div.querySelectorAll('sl-range');

                        if (inputs.length > 0 && ranges.length > 0) {
                            if (!intervalDiv) {
                                intervalDiv = div; // The first div with an input/range element - updateInterval
                            } else {
                                stepDiv = div; // The second div with an input/range element—updateStep
                                break;
                            }
                        }
                    }

                    const intervalInput = intervalDiv?.querySelector('sl-input');
                    const intervalRange = intervalDiv?.querySelector('sl-range');
                    const stepInput = stepDiv?.querySelector('sl-input');
                    const stepRange = stepDiv?.querySelector('sl-range');

                    if (intervalInput) {
                        intervalInput.value = preset.interval;
                        const inputEvent = new Event('input', { bubbles: true });
                        intervalInput.dispatchEvent(inputEvent);
                    }
                    if (intervalRange) {
                        intervalRange.value = preset.interval;
                        const rangeEvent = new Event('input', { bubbles: true });
                        intervalRange.dispatchEvent(rangeEvent);
                    }
                    if (stepInput) {
                        stepInput.value = preset.step;
                        const stepInputEvent = new Event('input', { bubbles: true });
                        stepInput.dispatchEvent(stepInputEvent);
                    }
                    if (stepRange) {
                        stepRange.value = preset.step;
                        const stepRangeEvent = new Event('input', { bubbles: true });
                        stepRange.dispatchEvent(stepRangeEvent);
                    }

                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement) {
                        if (typeof currentElement.updateUpdateInterval === 'function') {
                            currentElement.updateUpdateInterval(preset.interval);
                        }
                        if (typeof currentElement.updateUpdateStep === 'function') {
                            currentElement.updateUpdateStep(preset.step);
                        }
                    }
                });

                buttonGroup.appendChild(button);
            });

            settingDiv.appendChild(buttonGroup);
        }


        container.appendChild(settingDiv);
    });

    // Creating a block for radio settings
    if (radioSettings.length > 0) {
        radioSettings.forEach(setting => {
            const radioDiv = document.createElement('div');

            // Let's create a container for the header and the switch (like the one for brightness)
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.justifyContent = 'space-between';

            // Creating a Label
            const label = document.createElement('label');
            label.textContent = setting.label;
            label.style.display = 'block';
            label.style.fontSize = 'var(--sl-input-label-font-size-small)';
            label.style.fontWeight = 'var(--sl-input-label-font-weight)';
            label.style.color = 'var(--sl-input-label-color)';

            // Let's create a switch to turn the setting on or off
            const radioSwitch = document.createElement('sl-switch');
            radioSwitch.size = 'small';
            radioSwitch.checked = getSavedSetting(componentTagName, setting.name + '_enabled', 'false') === 'true';

            // Switch change handler
            radioSwitch.addEventListener('sl-change', (event) => {
                const isEnabled = event.target.checked;
                saveSetting(componentTagName, setting.name + '_enabled', isEnabled);
                updateRadioGroupVisibility(radioDiv, setting, componentTagName, isEnabled);

                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateColorSpace === 'function') {
                    if (isEnabled) {
                        // When turning it on, we apply the saved color space
                        const savedColorSpace = localStorage.getItem(`screensaver-${componentTagName}-${setting.name}`);
                        currentElement.updateColorSpace(savedColorSpace || setting.default);
                    } else {
                        // When shutting down, reset the color space
                        currentElement.updateColorSpace(null);
                    }
                }
            });

            headerDiv.appendChild(label);
            headerDiv.appendChild(radioSwitch);

            // Let's create a radio group
            const radioGroup = document.createElement('sl-radio-group');
            radioGroup.name = setting.name;
            radioGroup.value = getSavedSetting(componentTagName, setting.name, setting.default);
            radioGroup.size = 'small';

            // Add radio buttons
            setting.options.forEach(option => {
                const radio = document.createElement('sl-radio');
                radio.value = option.value;
                radio.innerText = option.label;
                radioGroup.appendChild(radio);
            });

            // radio-group change handler
            radioGroup.addEventListener('sl-change', (e) => {
                const value = e.target.value;
                saveSetting(componentTagName, setting.name, value);

                // When a radio button in a radio group is selected, the switch is automatically turned on
                if (!radioSwitch.checked) {
                    radioSwitch.checked = true;
                    saveSetting(componentTagName, setting.name + '_enabled', true);
                    updateRadioGroupVisibility(radioDiv, setting, componentTagName, true);
                }

                // We use a color space
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.updateColorSpace === 'function') {
                    currentElement.updateColorSpace(value);
                }
            });

            radioDiv.appendChild(headerDiv);
            radioDiv.appendChild(radioGroup);

            // Controlling the visibility of a radio group
            updateRadioGroupVisibility(radioDiv, setting, componentTagName, radioSwitch.checked);

            container.appendChild(radioDiv);
        });
    }


    // Let's create a block for color settings
    if (colorSettings.length > 0) {
        const colorsDiv = document.createElement('div');

        // Let's create a heading for the color block
        const colorsLabel = document.createElement('label');
        colorsLabel.textContent = 'Colors';
        colorsLabel.style.display = 'block';
        colorsLabel.style.fontSize = 'var(--sl-input-label-font-size-small)';
        colorsLabel.style.fontWeight = 'var(--sl-input-label-font-weight)';
        colorsLabel.style.color = 'var(--sl-input-label-color)';

        // Let's create a container for color strings
        const colorsContainer = document.createElement('div');
        colorsContainer.className = 'colors-container';

        colorSettings.forEach((setting, index) => {
            // Let's create a row for each color
            const colorRow = document.createElement('div');
            colorRow.className = 'color-row';
            colorRow.style.display = 'flex';
            colorRow.style.alignItems = 'center';
            colorRow.style.gap = 'var(--sl-spacing-medium)';
            colorRow.style.padding = 'var(--sl-spacing-small)';
            colorRow.style.border = '1px solid var(--sl-color-neutral-200)';
            colorRow.style.borderRadius = 'var(--sl-border-radius-medium)';

            // Color Picker (Swatch)
            const colorPicker = document.createElement('sl-color-picker');
            colorPicker.value = getSavedSetting(componentTagName, setting.name, setting.default);
            colorPicker.size = 'small';
            colorPicker.swatches = '#ff0000;#ff8000;#ffff00;#80ff00;#00ff80;#0080ff;#8000ff;#ffffff;#c0c0c0;#808080;#404040;#000000';

            colorPicker.addEventListener('sl-input', (e) => {
                const newHex = e.target.value;

                // For conical, linear, and color-fade gradients, we update the color array in the component
                if (componentTagName === 'conic-gradient-screensaver' || componentTagName === 'linear-gradient-screensaver' || componentTagName === 'color-transition-screensaver') {
                    const currentElement = document.querySelector(`${componentTagName}`);
                    if (currentElement && typeof currentElement.updateColor === 'function') {
                        const colorIndex = parseInt(setting.name.replace('color', '')) - 1;
                        currentElement.updateColor(colorIndex, newHex);
                    }
                } else {
                    // For the other components, save them as usual
                    saveSetting(componentTagName, setting.name, newHex);
                    updateCurrentScreensaver();
                }
            });

            const currentColor = getSavedSetting(componentTagName, setting.name, setting.default);

            // "Duplicate Color" button
            const duplicateButton = document.createElement('sl-button');
            duplicateButton.variant = 'default';
            duplicateButton.size = 'small';
            duplicateButton.innerHTML = '<sl-icon name="copy"></sl-icon>';
            duplicateButton.title = 'Duplicate Color';

            duplicateButton.addEventListener('click', () => {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.addColor === 'function') {
                    currentElement.addColor(currentColor);
                }
            });

            // Navigation Button Group
            const moveButtonGroup = document.createElement('sl-button-group');
            moveButtonGroup.label = 'Color Shift';

            // "Move Color Up" button
            const moveUpButton = document.createElement('sl-button');
            moveUpButton.variant = 'default';
            moveUpButton.size = 'small';
            moveUpButton.innerHTML = '<sl-icon name="arrow-up"></sl-icon>';
            moveUpButton.title = 'Move the color up';

            moveUpButton.addEventListener('click', () => {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.moveColorUp === 'function') {
                    currentElement.moveColorUp(index);
                }
            });

            // "Move Color Down" button
            const moveDownButton = document.createElement('sl-button');
            moveDownButton.variant = 'default';
            moveDownButton.size = 'small';
            moveDownButton.innerHTML = '<sl-icon name="arrow-down"></sl-icon>';
            moveDownButton.title = 'Move the color down';

            moveDownButton.addEventListener('click', () => {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.moveColorDown === 'function') {
                    currentElement.moveColorDown(index);
                }
            });

            // Add buttons to a group
            moveButtonGroup.appendChild(moveUpButton);
            moveButtonGroup.appendChild(moveDownButton);

            // "Delete Color" button
            const deleteButton = document.createElement('sl-button');
            deleteButton.variant = 'danger';
            deleteButton.size = 'small';
            deleteButton.innerHTML = '<sl-icon name="trash"></sl-icon>';
            deleteButton.title = 'Remove Color';

            deleteButton.addEventListener('click', () => {
                const currentElement = document.querySelector(`${componentTagName}`);
                if (currentElement && typeof currentElement.removeColor === 'function') {
                    currentElement.removeColor(index);
                }
            });

            // Disable buttons based on the color's position
            if (colorSettings.length <= 1) {
                // For solid-color or a single color, disable all control buttons
                moveUpButton.disabled = true;
                moveDownButton.disabled = true;
                deleteButton.disabled = true;
            } else {
                // Disable the "Up" button for the first color
                if (index === 0) {
                    moveUpButton.disabled = true;
                }
                // Disable the "down" button for the last color
                if (index === colorSettings.length - 1) {
                    moveDownButton.disabled = true;
                }
            }

            // Adding Elements to a String
            colorRow.appendChild(colorPicker);
            colorRow.appendChild(moveButtonGroup);
            colorRow.appendChild(duplicateButton);
            colorRow.appendChild(deleteButton);

            colorsContainer.appendChild(colorRow);
        });

        // "Add Color" button that spans the full width
        const addColorRow = document.createElement('div');

        const addColorButton = document.createElement('sl-button');
        addColorButton.variant = 'default';
        addColorButton.outline = true;
        addColorButton.size = 'small';
        addColorButton.style.width = '100%';
        addColorButton.innerHTML = '<sl-icon name="plus" slot="prefix"></sl-icon>Add a color';

        addColorButton.addEventListener('click', () => {
            const currentElement = document.querySelector(`${componentTagName}`);
            if (currentElement && typeof currentElement.addColor === 'function') {
                currentElement.addColor();
            }
        });

        addColorRow.appendChild(addColorButton);

        colorsDiv.appendChild(colorsLabel);
        colorsDiv.appendChild(colorsContainer);
        colorsDiv.appendChild(addColorRow);
        container.appendChild(colorsDiv);
    }
}

// Function for controlling the visibility of a radio group
function updateRadioGroupVisibility(container, setting, componentTagName, isEnabled) {
    const radioGroup = container.querySelector('sl-radio-group');
    if (radioGroup) {
        radioGroup.style.display = isEnabled ? '' : 'none';
    }
}

// Function for Retrieving Saved Settings
function getSavedSetting(componentName, settingName, defaultValue) {
    // For "solid-color," we get a single color
    if (componentName === 'solid-color-screensaver' && settingName === 'color') {
        const colorKey = `screensaver-${componentName}-color`;
        const savedColor = localStorage.getItem(colorKey);
        return savedColor !== null ? savedColor : defaultValue;
    }

    // For the color settings of the conical gradient and color transitions, we retrieve the following from the color array
    if ((componentName === 'conic-gradient-screensaver' || componentName === 'color-transition-screensaver') && settingName.startsWith('color')) {
        const colorsKey = `screensaver-${componentName}-colors`;
        const savedColors = localStorage.getItem(colorsKey);
        if (savedColors) {
            try {
                const colors = JSON.parse(savedColors);
                const colorIndex = parseInt(settingName.replace('color', '')) - 1;
                if (colorIndex >= 0 && colorIndex < colors.length) {
                    return colors[colorIndex];
                }
            } catch (e) {
            }
        }
    }

    const key = `screensaver-${componentName}-${settingName}`;
    const saved = localStorage.getItem(key);
    return saved !== null ? saved : defaultValue;
}

// Setting Save Function
function saveSetting(componentName, settingName, value) {
    const key = `screensaver-${componentName}-${settingName}`;
    localStorage.setItem(key, value);
}

// Function to retrieve a component's class by name
function getComponentClass(componentName) {
    switch (componentName) {
        case 'linear-gradient-screensaver':
            return LinearGradientScreensaver;
        case 'conic-gradient-screensaver':
            return ConicGradientScreensaver;
        case 'color-transition-screensaver':
            return ColorTransitionScreensaver;
        case 'solid-color-screensaver':
            return SolidColorScreensaver;
        default:
            return null;
    }
}

// A feature that updates the current screensaver with new settings
function updateCurrentScreensaver() {
    const container = document.getElementById('screensaver-container');
    const currentElement = container.firstElementChild;

    if (currentElement) {
        const componentName = currentElement.tagName.toLowerCase();
        const settings = getComponentClass(componentName).getSettings();

        settings.forEach(setting => {
            const value = getSavedSetting(componentName, setting.name, setting.default);

            // Skip disabled settings
            if (setting.disabled) {
                return;
            }

            if (setting.name === 'speed') {
                currentElement.updateSpeed(value);
            } else if (setting.name === 'color' && componentName === 'solid-color-screensaver' && typeof currentElement.updateColor === 'function') {
                currentElement.updateColor(value);
            } else if (setting.name.startsWith('color') && typeof currentElement.updateColor === 'function') {
                const colorIndex = parseInt(setting.name.replace('color', '')) - 1;
                currentElement.updateColor(colorIndex, value);
            } else if (setting.name === 'offsetX' && typeof currentElement.updateOffsetX === 'function') {
                currentElement.updateOffsetX(value);
            } else if (setting.name === 'offsetY' && typeof currentElement.updateOffsetY === 'function') {
                currentElement.updateOffsetY(value);
            } else if (setting.name === 'updateInterval' && typeof currentElement.updateUpdateInterval === 'function') {
                currentElement.updateUpdateInterval(value);
            } else if (setting.name === 'updateStep' && typeof currentElement.updateUpdateStep === 'function') {
                currentElement.updateUpdateStep(value);
            } else if (setting.name === 'colorSpace' && typeof currentElement.updateColorSpace === 'function') {
                currentElement.updateColorSpace(value);
            } else if (setting.name === 'positionCenter' && typeof currentElement.updatePositionCenter === 'function') {
                currentElement.updatePositionCenter(value);
            } else if (setting.name === 'globalScale' && typeof currentElement.updateGlobalScale === 'function') {
                currentElement.updateGlobalScale(value);
            } else if (setting.name === 'globalRotation' && typeof currentElement.updateGlobalRotation === 'function') {
                currentElement.updateGlobalRotation(value);
            } else if (setting.name === 'backgroundSize' && componentName === 'linear-gradient-screensaver' && typeof currentElement.updateBackgroundSize === 'function') {
                currentElement.updateBackgroundSize(value);
            } else if (setting.name === 'animationEnabled' && typeof currentElement.updateAnimationEnabled === 'function') {
                console.log(`[Debugging] Changing the animation settings for ${componentName}: ${value === 'true' ? 'ON' : 'OFF'}`);
                currentElement.updateAnimationEnabled(value === 'true');
            }
        });
    }
}

// Screensaver Toggle Feature
function switchScreensaver(type) {
    // Information about the current screensaver
    const screensaverNames = {
        'linear-gradient': 'Linear gradient',
        'conic-gradient': 'Conical gradient',
        'color-transition': 'Color Change',
        'solid-color': 'Solid color'
    };

    const container = document.getElementById('screensaver-container');
    const settingsContainer = document.getElementById('screensaver-settings');
    const brightnessContainer = document.getElementById('brightness-settings');

    // Cleaning the containers
    container.innerHTML = '';
    brightnessContainer.innerHTML = '';

    // Get the component class
    let componentClass;
    switch (type) {
        case 'linear-gradient':
            componentClass = LinearGradientScreensaver;
            break;
        case 'conic-gradient':
            componentClass = ConicGradientScreensaver;
            break;
        case 'color-transition':
            componentClass = ColorTransitionScreensaver;
            break;
        case 'solid-color':
            componentClass = SolidColorScreensaver;
            break;
        default:
            return;
    }

    // Creating a New Component
    const component = document.createElement(`${type}-screensaver`);

    // Loading settings from localStorage
    const settings = componentClass.getSettings();
    const componentTagName = `${type}-screensaver`;
    settings.forEach(setting => {
        // For color settings such as conical gradients, color transitions, and solid colors, we do not set any attributes,
        // since the colors are loaded from localStorage in the connectedCallback
        if (!(componentTagName === 'conic-gradient-screensaver' && setting.type === 'color') &&
            !(componentTagName === 'color-transition-screensaver' && setting.type === 'color') &&
            !(componentTagName === 'solid-color-screensaver' && setting.type === 'color')) {
            const value = getSavedSetting(componentTagName, setting.name, setting.default);
            component.setAttribute(`data-${setting.name}`, value);
        }
    });

    // Add a component to the container
    container.appendChild(component);

    // Creating Dynamic Controls
    createSettingsControls(componentClass, settingsContainer);

    // Add the brightness settings AFTER you've configured the basic settings
    addBrightnessControl(brightnessContainer);

    // Applying brightness settings
    updateBrightness();

    // Save the selection to localStorage
    localStorage.setItem('selectedScreensaver', type);
}

// Select Change Handler
screensaverSelect.addEventListener('sl-change', (event) => {
    const selectedValue = event.target.value;
    switchScreensaver(selectedValue);
});

// A handler for the switch brightness change will be added to addBrightnessControl

// Function to update the size of the current screensaver
function updateCurrentScreensaverSize() {
    const container = document.getElementById('screensaver-container');
    if (container && container.firstElementChild) {
        const component = container.firstElementChild;
        // Check whether the component has an `updateTransform` method
        if (component.updateTransform) {
            component.updateTransform();
        }
    }
}

// Function to force the loading of a splash screen from storage
function forceLoadScreensaver() {
    // Retrieve the saved screensaver or use the default value
    const savedScreensaver = localStorage.getItem('selectedScreensaver') || 'linear-gradient';

    // Set a value in the drop-down menu
    if (screensaverSelect) {
        screensaverSelect.value = savedScreensaver;
    }

    // Displaying the selected screensaver
    switchScreensaver(savedScreensaver);
}

// Additional initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // If the main components have already been registered, load the splash screen
    const checkComponentsReady = () => {
        const components = [
            'sl-select', 'sl-option',
            'linear-gradient-screensaver', 'conic-gradient-screensaver',
            'color-transition-screensaver', 'solid-color-screensaver'
        ];

        const ready = components.every(name => customElements.get(name));
        if (ready) {
            forceLoadScreensaver();
        }
    };

    checkComponentsReady();
});

// Initialization When the Page Loads
window.addEventListener('load', () => {
    // Waiting for the main Shoelace components and splash screen components to initialize
    const componentPromises = [
        customElements.whenDefined('sl-select'),
        customElements.whenDefined('sl-option'),
        // Waiting for the splash screen components to be registered
        customElements.whenDefined('linear-gradient-screensaver'),
        customElements.whenDefined('conic-gradient-screensaver'),
        customElements.whenDefined('color-transition-screensaver'),
        customElements.whenDefined('solid-color-screensaver')
    ];

    Promise.all(componentPromises).then(() => {
        forceLoadScreensaver();

        // Configure the window resize handler to update the screensaver
        window.addEventListener('resize', () => {
            updateCurrentScreensaverSize();
        });
    }).catch((error) => {
        // Even if an error occurs, we try to load the splash screen
        forceLoadScreensaver();
    });
});