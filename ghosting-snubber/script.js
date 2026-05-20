document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los controles
    const leakageInput = document.getElementById('leakage');
    const thresholdInput = document.getElementById('threshold');
    const snubberToggle = document.getElementById('snubber-toggle');
    const snubberResInput = document.getElementById('snubber-res');
    
    // Referencias a las etiquetas de valor (Badges)
    const leakageVal = document.getElementById('leakage-val');
    const thresholdVal = document.getElementById('threshold-val');
    const snubberResVal = document.getElementById('snubber-res-val');
    
    // Referencias a la visualización y estado
    const snubberResGroup = document.getElementById('snubber-res-group');
    const snubberComp = document.getElementById('snubber-comp');
    const ledBulb = document.getElementById('led-bulb');
    const displayItotal = document.getElementById('display-itotal');
    const displayIsnub = document.getElementById('display-isnub');
    const displayIled = document.getElementById('display-iled');
    const systemStatus = document.getElementById('system-status');
    const systemDesc = document.getElementById('system-desc');
    const statusPanel = document.getElementById('status-panel');

    // Impedancia fija equivalente del driver del LED para la simulación (kOhms)
    // En la vida real esto es dinámico por los diodos, pero sirve para la proporción de impedancia pasiva.
    const R_LED = 20; 

    function calculateAndRender() {
        // 1. Obtener valores de la interfaz
        const i_total = parseFloat(leakageInput.value);
        const threshold = parseFloat(thresholdInput.value);
        const hasSnubber = snubberToggle.checked;
        const r_snub = parseFloat(snubberResInput.value);

        // 2. Actualizar las insignias numéricas
        leakageVal.textContent = i_total.toFixed(1);
        thresholdVal.textContent = threshold.toFixed(1);
        snubberResVal.textContent = r_snub.toFixed(0);

        // 3. Modificar la UI si el snubber se desactiva
        if (hasSnubber) {
            snubberResGroup.style.opacity = '1';
            snubberResInput.disabled = false;
            snubberComp.classList.remove('disabled');
        } else {
            snubberResGroup.style.opacity = '0.4';
            snubberResInput.disabled = true;
            snubberComp.classList.add('disabled');
        }

        // 4. Matemáticas del Divisor de Corriente
        let i_snub = 0;
        let i_led = 0;

        if (hasSnubber) {
            // Fórmula divisor: I_rama1 = I_total * (R_rama2 / (R_rama1 + R_rama2))
            i_led = i_total * (r_snub / (r_snub + R_LED));
            i_snub = i_total - i_led;
        } else {
            // Sin circuito alterno, toda la fuga se va hacia la cinta LED
            i_led = i_total;
            i_snub = 0;
        }

        // 5. Actualizar los monitores de corriente en el esquemático
        displayItotal.textContent = `${i_total.toFixed(2)} mA`;
        displayIsnub.textContent = `${i_snub.toFixed(2)} mA`;
        displayIled.textContent = `${i_led.toFixed(2)} mA`;

        // 6. Lógica de evaluación de Ghosting
        if (i_led >= threshold) {
            // La corriente residual supera el umbral: Ocurre Ghosting
            ledBulb.classList.add('on');
            systemStatus.textContent = "GHOSTING ACTIVO";
            systemDesc.innerHTML = `La corriente desviada hacia la cinta LED (<strong>${i_led.toFixed(2)} mA</strong>) supera el umbral de conducción de los diodos (<strong>${threshold.toFixed(1)} mA</strong>). La luz emitirá brillo residual.`;
            statusPanel.className = 'status-panel status-ghosting';
        } else {
            // La corriente residual es insuficiente: Corte limpio
            ledBulb.classList.remove('on');
            systemStatus.textContent = "CORTE LIMPIO (OFF)";
            systemDesc.innerHTML = `La corriente hacia la cinta (<strong>${i_led.toFixed(2)} mA</strong>) es inferior al umbral. El Snubber absorbe eficientemente la fuga. La luz permanece apagada.`;
            statusPanel.className = 'status-panel status-off';
        }
    }

    // Escuchar cambios en todos los inputs para recalcular en tiempo real
    leakageInput.addEventListener('input', calculateAndRender);
    thresholdInput.addEventListener('input', calculateAndRender);
    snubberToggle.addEventListener('change', calculateAndRender);
    snubberResInput.addEventListener('input', calculateAndRender);

    // Renderizar estado inicial
    calculateAndRender();
});