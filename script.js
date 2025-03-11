document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initializeCharts();
    
    // Handle token model selection
    const tokenModelSelect = document.getElementById('tokenModel');
    const dualTokenDetails = document.getElementById('dualTokenDetails');
    const singleTokenDetails = document.getElementById('singleTokenDetails');

    if (tokenModelSelect) {
        tokenModelSelect.addEventListener('change', function() {
            if (this.value === 'dual') {
                dualTokenDetails.classList.remove('hidden');
                singleTokenDetails.classList.add('hidden');
            } else {
                dualTokenDetails.classList.add('hidden');
                singleTokenDetails.classList.remove('hidden');
            }
        });
    }

    // Update allocation chart when allocation inputs change
    const allocationInputs = ['communityAllocation', 'teamAllocation', 'investorsAllocation', 'reservesAllocation'];
    
    allocationInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateAllocationChart);
        } else {
            console.warn(`Element with ID '${id}' not found`);
        }
    });

    // Add custom allocation button
    const addCustomAllocationBtn = document.getElementById('addCustomAllocation');
    if (addCustomAllocationBtn) {
        addCustomAllocationBtn.addEventListener('click', addCustomAllocation);
    }
    
    // Blockchain and exchange buttons
    const addBlockchainBtn = document.getElementById('addBlockchain');
    const addCEXBtn = document.getElementById('addCEX');
    
    if (addBlockchainBtn) addBlockchainBtn.addEventListener('click', addBlockchain);
    if (addCEXBtn) addCEXBtn.addEventListener('click', addCEX);
    
    // Initial chart updates and setup
    updateAllocationChart();
    updateBlockchainChart();
    updateSupplyChart();
    
    // Add input listeners for supply chart
    const supplyInputs = ['totalSupply', 'initialCirculatingSupply'];
    supplyInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateSupplyChart);
        }
    });
    
    // Add initial CEX remove button listeners
    document.querySelectorAll('#cex-listings .remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Update to only include save and export functionality
    setupDataPersistence();

    // Explicitly add event listeners for save and export buttons
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    console.log("Save button found:", !!saveBtn);
    console.log("Export button found:", !!exportBtn);
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            console.log("Save button clicked");
            saveFormData();
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log("Export button clicked");
            exportFormData();
        });
    }

    // Force allocation chart update
    setTimeout(updateAllocationChart, 100);

    // Add this debugging and forced chart update code
    function forceRenderAllocationChart() {
        console.log("Force rendering allocation chart");
        
        // Check if chart container exists
        const chartCanvas = document.getElementById('allocationChart');
        if (!chartCanvas) {
            console.error("Chart canvas #allocationChart not found!");
            return;
        }
        
        console.log("Chart canvas dimensions:", chartCanvas.width, chartCanvas.height);
        
        // Check if Chart is defined (library loaded)
        if (typeof Chart === 'undefined') {
            console.error("Chart.js library not loaded!");
            return;
        }
        
        // Get data for chart
        const communityValue = parseFloat(document.getElementById('communityAllocation').value) || 0;
        const teamValue = parseFloat(document.getElementById('teamAllocation').value) || 0;
        const investorsValue = parseFloat(document.getElementById('investorsAllocation').value) || 0;
        const reservesValue = parseFloat(document.getElementById('reservesAllocation').value) || 0;
        
        const labels = ['Community & Ecosystem', 'Team & Advisors', 'Investors', 'Reserves'];
        const values = [communityValue, teamValue, investorsValue, reservesValue];
        
        console.log("Chart data:", {labels, values});
        
        // Destroy existing chart if it exists
        if (window.allocationChart) {
            window.allocationChart.destroy();
            window.allocationChart = null;
        }
        
        // Create new chart
        window.allocationChart = new Chart(chartCanvas, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        console.log("Chart created:", window.allocationChart);
    }

    // Call this function after page load
    console.log("Setting timeout for chart rendering");
    // Add a delay to ensure the DOM is fully rendered
    setTimeout(forceRenderAllocationChart, 500);
});

// Initialize charts - split out for clarity
function initializeCharts() {
    // We'll initialize charts on demand now
}

// Function to add a custom allocation field
function addCustomAllocation() {
    const customAllocations = document.getElementById('customAllocations');
    if (!customAllocations) {
        console.error("Custom allocations container not found");
        return;
    }
    
    const customId = 'custom' + (customAllocations.children.length + 1);
    
    const newAllocationDiv = document.createElement('div');
    newAllocationDiv.className = 'input-group custom-allocation';
    newAllocationDiv.innerHTML = `
        <div class="custom-allocation-row">
            <input type="text" id="${customId}Name" placeholder="Allocation Name" class="custom-name">
            <input type="number" id="${customId}Value" min="0" max="100" value="0" class="custom-value">
            <span class="percentage-symbol">%</span>
            <button class="remove-btn">×</button>
        </div>
    `;
    
    customAllocations.appendChild(newAllocationDiv);
    
    // Add event listener to remove button
    const removeBtn = newAllocationDiv.querySelector('.remove-btn');
    removeBtn.addEventListener('click', function() {
        customAllocations.removeChild(newAllocationDiv);
        updateAllocationChart(); // Update chart after removing
    });
    
    // Add event listeners to the new input fields
    const valueInput = newAllocationDiv.querySelector('input[type="number"]');
    const nameInput = newAllocationDiv.querySelector('input[type="text"]');
    valueInput.addEventListener('input', updateAllocationChart);
    nameInput.addEventListener('input', updateAllocationChart);
    
    updateAllocationChart(); // Update chart after adding
}

// Updated updateAllocationChart function to ensure chart rendering
function updateAllocationChart() {
    console.log("Updating allocation chart...");
    // Get standard allocation values
    const communityValue = parseFloat(document.getElementById('communityAllocation').value) || 0;
    const teamValue = parseFloat(document.getElementById('teamAllocation').value) || 0;
    const investorsValue = parseFloat(document.getElementById('investorsAllocation').value) || 0;
    const reservesValue = parseFloat(document.getElementById('reservesAllocation').value) || 0;
    
    // Add to labels and values
    const labels = ['Community & Ecosystem', 'Team & Advisors', 'Investors', 'Reserves'];
    const values = [communityValue, teamValue, investorsValue, reservesValue];
    
    // Get custom allocations
    const customAllocations = document.querySelectorAll('.custom-allocation');
    customAllocations.forEach(allocation => {
        const nameInput = allocation.querySelector('.custom-name');
        const valueInput = allocation.querySelector('.custom-value');
        
        if (nameInput && valueInput && nameInput.value.trim() !== '') {
            labels.push(nameInput.value);
            values.push(parseFloat(valueInput.value) || 0);
        }
    });
    
    // Calculate total
    const total = values.reduce((sum, value) => sum + value, 0);
    
    // Show warning if total isn't 100%
    const warningElement = document.getElementById('allocationWarning');
    if (warningElement) {
        if (Math.abs(total - 100) > 0.01) {
            warningElement.textContent = `Warning: Total allocation is ${total.toFixed(2)}% (should be 100%)`;
            warningElement.classList.remove('hidden');
        } else {
            warningElement.classList.add('hidden');
        }
    }
    
    // Get canvas context
    const ctx = document.getElementById('allocationChart');
    if (!ctx) {
        console.error("Allocation chart canvas not found");
        return;
    }
    
    console.log("Chart data:", {labels, values});
    
    // Create or update chart
    if (window.allocationChart) {
        console.log("Updating existing chart");
        window.allocationChart.data.labels = labels;
        window.allocationChart.data.datasets[0].data = values;
        window.allocationChart.update();
    } else {
        console.log("Creating new chart");
        window.allocationChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#8AC656', '#F2C094',
                        '#5D9CEC', '#AC92EC', '#EC87C0', '#CCD1D9'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map(function(label, i) {
                                        const value = data.datasets[0].data[i];
                                        const backgroundColor = data.datasets[0].backgroundColor[i];
                                        
                                        return {
                                            text: `${label}: ${value}%`,
                                            fillStyle: backgroundColor,
                                            hidden: isNaN(value) || value === 0,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Blockchain listings functionality
let blockchainCount = 1;

function addBlockchain() {
    blockchainCount++;
    const blockchainContainer = document.getElementById('blockchain-listings');
    if (!blockchainContainer) {
        console.error("Blockchain listings container not found");
        return;
    }
    
    const newBlockchain = document.createElement('div');
    newBlockchain.className = 'blockchain-item';
    newBlockchain.innerHTML = `
        <div class="input-group">
            <label for="blockchain${blockchainCount}">Blockchain Name:</label>
            <input type="text" id="blockchain${blockchainCount}" placeholder="e.g., Ethereum, Solana, etc.">
        </div>
        <div class="input-group">
            <label for="liquidity${blockchainCount}">Liquidity Allocation (%):</label>
            <input type="number" id="liquidity${blockchainCount}" min="0" max="100" value="0">
        </div>
        <div class="input-group">
            <label for="contract${blockchainCount}">Contract Type/Standard:</label>
            <input type="text" id="contract${blockchainCount}" placeholder="e.g., ERC-20, SPL, etc.">
        </div>
        <button class="remove-btn blockchain-remove">×</button>
    `;
    
    blockchainContainer.appendChild(newBlockchain);
    
    // Add event listeners
    newBlockchain.querySelector('.blockchain-remove').addEventListener('click', function() {
        blockchainContainer.removeChild(newBlockchain);
        updateBlockchainChart();
    });
    
    newBlockchain.querySelector(`#liquidity${blockchainCount}`).addEventListener('input', updateBlockchainChart);
    newBlockchain.querySelector(`#blockchain${blockchainCount}`).addEventListener('input', function() {
        updateBlockchainChart();
    });
    
    updateBlockchainChart();
}

function updateBlockchainChart() {
    const blockchains = document.querySelectorAll('.blockchain-item');
    const labels = [];
    const values = [];
    
    blockchains.forEach(blockchain => {
        const nameInput = blockchain.querySelector('input[id^="blockchain"]');
        const liquidityInput = blockchain.querySelector('input[id^="liquidity"]');
        
        if (nameInput && nameInput.value.trim() !== '') {
            labels.push(nameInput.value);
            values.push(parseFloat(liquidityInput?.value || 0));
        }
    });
    
    // Calculate total allocation
    const totalLiquidity = values.reduce((sum, value) => sum + value, 0);
    
    // Show warning if total is not 100%
    const warningElement = document.getElementById('liquidityWarning');
    if (warningElement) {
        if (Math.abs(totalLiquidity - 100) > 0.01) {
            warningElement.textContent = `Warning: Total liquidity allocation is ${totalLiquidity.toFixed(2)}% (should be 100%)`;
            warningElement.classList.remove('hidden');
        } else {
            warningElement.classList.add('hidden');
        }
    }
    
    const ctx = document.getElementById('blockchainChart')?.getContext('2d');
    if (!ctx) {
        console.error("Blockchain chart canvas not found");
        return;
    }
    
    // Initialize or update chart
    if (window.blockchainChart) {
        window.blockchainChart.data.labels = labels;
        window.blockchainChart.data.datasets[0].data = values;
        window.blockchainChart.update();
    } else {
        // Create chart if it doesn't exist
        window.blockchainChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56', 
                        '#9966FF', '#FF9F40', '#8AC656', '#F2C094'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Add supply chart function
function updateSupplyChart() {
    const totalSupply = parseFloat(document.getElementById('totalSupply')?.value || 0);
    const initialCirculating = parseFloat(document.getElementById('initialCirculatingSupply')?.value || 0);
    
    // Calculate locked/reserved supply (ensure it's not negative)
    const lockedSupply = Math.max(0, totalSupply - initialCirculating);
    
    const ctx = document.getElementById('supplyChart')?.getContext('2d');
    if (!ctx) {
        console.error("Supply chart canvas not found");
        return;
    }
    
    // Check if values are valid
    if (totalSupply <= 0) {
        // Don't render chart or show a placeholder
        return;
    }
    
    const labels = ['Initial Circulating Supply', 'Locked/Reserved Supply'];
    const data = [initialCirculating, lockedSupply];
    
    // Initialize or update chart
    if (window.supplyChart) {
        window.supplyChart.data.labels = labels;
        window.supplyChart.data.datasets[0].data = data;
        window.supplyChart.update();
    } else {
        // Create chart if it doesn't exist
        window.supplyChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#36A2EB', '#FF6384'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = ((value / totalSupply) * 100).toFixed(2);
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Function to add CEX exchange
function addCEX() {
    const cexContainer = document.getElementById('cex-listings');
    
    const newExchange = document.createElement('div');
    newExchange.className = 'exchange-item';
    newExchange.innerHTML = `
        <input type="text" placeholder="Exchange Name" class="exchange-name">
        <button class="remove-btn">×</button>
    `;
    
    cexContainer.appendChild(newExchange);
    
    // Add event listener to remove button
    newExchange.querySelector('.remove-btn').addEventListener('click', function() {
        cexContainer.removeChild(newExchange);
    });
}

// Update the data persistence setup to remove import functionality
function setupDataPersistence() {
    // Try to load saved data on page load
    try {
        const savedData = localStorage.getItem('tokenomicsData');
        if (savedData) {
            const data = JSON.parse(savedData);
            populateFormData(data);
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

// Helper function to collect all form data
function getFormData() {
    const data = {
        tokenModel: {
            model: document.getElementById('tokenModel').value,
            singleToken: document.getElementById('tokenName').value,
            dualToken: {
                utilityToken: document.getElementById('utilityTokenName')?.value || '',
                governanceToken: document.getElementById('governanceTokenName')?.value || ''
            }
        },
        tokenSupply: {
            totalSupply: document.getElementById('totalSupply').value,
            initialCirculatingSupply: document.getElementById('initialCirculatingSupply').value,
            emissionSchedule: document.getElementById('emissionSchedule').value
        },
        tokenAllocation: {
            communityAllocation: document.getElementById('communityAllocation').value,
            teamAllocation: document.getElementById('teamAllocation').value,
            investorsAllocation: document.getElementById('investorsAllocation').value,
            reservesAllocation: document.getElementById('reservesAllocation').value,
            customAllocations: getCustomAllocations()
        },
        governance: {
            model: document.getElementById('governanceModel').value,
            votingMechanism: document.getElementById('votingMechanism').value
        },
        // ... include other sections as needed
    };
    
    return data;
}

function getCustomAllocations() {
    const customAllocations = [];
    document.querySelectorAll('.custom-allocation').forEach((element, index) => {
        const nameInput = element.querySelector('.custom-name');
        const valueInput = element.querySelector('.custom-value');
        
        if (nameInput && valueInput && nameInput.value.trim() !== '') {
            customAllocations.push({
                name: nameInput.value,
                value: valueInput.value
            });
        }
    });
    return customAllocations;
}

// Helper function to populate form with data
function populateFormData(data) {
    // Set token model
    const tokenModelSelect = document.getElementById('tokenModel');
    if (tokenModelSelect) {
        tokenModelSelect.value = data.tokenModel.model || 'single';
        
        // Trigger the change event
        const event = new Event('change');
        tokenModelSelect.dispatchEvent(event);
    }
    
    // Set token details
    if (data.tokenModel.model === 'dual') {
        document.getElementById('utilityTokenName').value = data.tokenModel.dualToken.utilityToken || '';
        document.getElementById('governanceTokenName').value = data.tokenModel.dualToken.governanceToken || '';
    } else {
        document.getElementById('tokenName').value = data.tokenModel.singleToken || '';
    }
    
    // Set token supply
    if (data.tokenSupply) {
        document.getElementById('totalSupply').value = data.tokenSupply.totalSupply || '';
        document.getElementById('initialCirculatingSupply').value = data.tokenSupply.initialCirculatingSupply || '';
        document.getElementById('emissionSchedule').value = data.tokenSupply.emissionSchedule || '';
    }
    
    // Set standard allocations
    if (data.tokenAllocation) {
        document.getElementById('communityAllocation').value = data.tokenAllocation.communityAllocation || '40';
        document.getElementById('teamAllocation').value = data.tokenAllocation.teamAllocation || '20';
        document.getElementById('investorsAllocation').value = data.tokenAllocation.investorsAllocation || '20';
        document.getElementById('reservesAllocation').value = data.tokenAllocation.reservesAllocation || '20';
    }
    
    // Handle custom allocations
    const customAllocations = document.getElementById('customAllocations');
    if (customAllocations) {
        // Clear existing custom allocations
        customAllocations.innerHTML = '';
        
        // Add saved custom allocations
        data.tokenAllocation.customAllocations.forEach((allocation, index) => {
            const newAllocationDiv = document.createElement('div');
            newAllocationDiv.className = 'input-group custom-allocation';
            newAllocationDiv.innerHTML = `
                <div class="custom-allocation-row">
                    <input type="text" id="custom${index + 1}Name" placeholder="Allocation Name" class="custom-name" value="${allocation.name}">
                    <input type="number" id="custom${index + 1}Value" min="0" max="100" value="${allocation.value}" class="custom-value">
                    <span class="percentage-symbol">%</span>
                    <button class="remove-btn">×</button>
                </div>
            `;
            
            customAllocations.appendChild(newAllocationDiv);
            
            // Add event listener to remove button
            const removeBtn = newAllocationDiv.querySelector('.remove-btn');
            removeBtn.addEventListener('click', function() {
                customAllocations.removeChild(newAllocationDiv);
                updateAllocationChart();
            });
            
            // Add event listeners to the input fields
            const valueInput = newAllocationDiv.querySelector('input[type="number"]');
            const nameInput = newAllocationDiv.querySelector('input[type="text"]');
            valueInput.addEventListener('input', updateAllocationChart);
            nameInput.addEventListener('input', updateAllocationChart);
        });
    }
    
    // Update the chart with the populated data
    updateAllocationChart();
    
    // Handle blockchains
    const blockchainContainer = document.getElementById('blockchain-listings');
    if (blockchainContainer && data.blockchains && data.blockchains.length > 0) {
        // Clear existing blockchains except the first one
        while (blockchainContainer.children.length > 1) {
            blockchainContainer.removeChild(blockchainContainer.lastChild);
        }
        
        // Update the first blockchain
        if (blockchainContainer.children[0]) {
            const firstBlockchain = data.blockchains[0];
            blockchainContainer.children[0].querySelector('input[id^="blockchain"]').value = firstBlockchain.name || '';
            blockchainContainer.children[0].querySelector('input[id^="liquidity"]').value = firstBlockchain.liquidity || '0';
            blockchainContainer.children[0].querySelector('input[id^="contract"]').value = firstBlockchain.contract || '';
        }
        
        // Add additional blockchains
        for (let i = 1; i < data.blockchains.length; i++) {
            blockchainCount++;
            const blockchain = data.blockchains[i];
            
            const newBlockchain = document.createElement('div');
            newBlockchain.className = 'blockchain-item';
            newBlockchain.innerHTML = `
                <div class="input-group">
                    <label for="blockchain${blockchainCount}">Blockchain Name:</label>
                    <input type="text" id="blockchain${blockchainCount}" placeholder="e.g., Ethereum, Solana, etc." value="${blockchain.name || ''}">
                </div>
                <div class="input-group">
                    <label for="liquidity${blockchainCount}">Liquidity Allocation (%):</label>
                    <input type="number" id="liquidity${blockchainCount}" min="0" max="100" value="${blockchain.liquidity || '0'}">
                </div>
                <div class="input-group">
                    <label for="contract${blockchainCount}">Contract Type/Standard:</label>
                    <input type="text" id="contract${blockchainCount}" placeholder="e.g., ERC-20, SPL, etc." value="${blockchain.contract || ''}">
                </div>
                <button class="remove-btn blockchain-remove">×</button>
            `;
            
            blockchainContainer.appendChild(newBlockchain);
            
            // Add event listeners
            newBlockchain.querySelector('.blockchain-remove').addEventListener('click', function() {
                blockchainContainer.removeChild(newBlockchain);
                updateBlockchainChart();
            });
            
            newBlockchain.querySelector(`#liquidity${blockchainCount}`).addEventListener('input', updateBlockchainChart);
            newBlockchain.querySelector(`#blockchain${blockchainCount}`).addEventListener('input', function() {
                updateBlockchainChart();
            });
        }
        
        updateBlockchainChart();
    }
    
    // Handle only CEX exchange listings
    // Clear existing CEX listings
    const cexContainer = document.getElementById('cex-listings');
    if (cexContainer) {
        cexContainer.innerHTML = '';
        
        // Add saved CEX listings
        if (data.exchanges && data.exchanges.cex) {
            data.exchanges.cex.forEach(cex => {
                const newExchange = document.createElement('div');
                newExchange.className = 'exchange-item';
                newExchange.innerHTML = `
                    <input type="text" placeholder="Exchange Name" class="exchange-name" value="${cex.name || ''}">
                    <button class="remove-btn">×</button>
                `;
                
                cexContainer.appendChild(newExchange);
                
                // Add event listener to remove button
                newExchange.querySelector('.remove-btn').addEventListener('click', function() {
                    cexContainer.removeChild(newExchange);
                });
            });
        }
        
        // Add an empty one if none exist
        if (cexContainer.children.length === 0) {
            const newExchange = document.createElement('div');
            newExchange.className = 'exchange-item';
            newExchange.innerHTML = `
                <input type="text" placeholder="Exchange Name" class="exchange-name">
                <button class="remove-btn">×</button>
            `;
            
            cexContainer.appendChild(newExchange);
            
            // Add event listener to remove button
            newExchange.querySelector('.remove-btn').addEventListener('click', function() {
                cexContainer.removeChild(newExchange);
            });
        }
    }
    
    // Set other form data
    if (data.tokenomicsFundamentals) {
        document.getElementById('initialMarketCap').value = data.tokenomicsFundamentals.initialMarketCap || '';
        document.getElementById('initialTokenPrice').value = data.tokenomicsFundamentals.initialTokenPrice || '';
        document.getElementById('vestingSchedule').value = data.tokenomicsFundamentals.vestingSchedule || '';
    }
    
    if (data.gameEconomy) {
        document.getElementById('earningMechanics').value = data.gameEconomy.earningMechanics || '';
        document.getElementById('spendingMechanics').value = data.gameEconomy.spendingMechanics || '';
        document.getElementById('sinks').value = data.gameEconomy.sinks || '';
        document.getElementById('incentiveMechanisms').value = data.gameEconomy.incentiveMechanisms || '';
    }
    
    if (data.governance) {
        document.getElementById('governanceModel').value = data.governance.model || '';
        document.getElementById('votingMechanism').value = data.governance.votingMechanism || '';
    }
    
    if (data.deflationary) {
        document.getElementById('tokenBurning').value = data.deflationary.tokenBurning || '';
        document.getElementById('inGameSinks').value = data.deflationary.inGameSinks || '';
    }
    
    if (data.regulatory) {
        document.getElementById('legalFramework').value = data.regulatory.legalFramework || '';
        document.getElementById('transparencyMeasures').value = data.regulatory.transparencyMeasures || '';
    }
    
    document.getElementById('additionalNotes').value = data.additionalNotes || '';
}

// Ensure these functions are defined
function saveFormData() {
    console.log("Running saveFormData function");
    try {
        const data = getFormData();
        console.log("Form data collected:", data);
        localStorage.setItem('tokenomicsData', JSON.stringify(data));
        alert('Data saved successfully!');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data: ' + error.message);
    }
}

function exportFormData() {
    console.log("Running exportFormData function");
    try {
        const data = getFormData();
        console.log("Form data collected for export:", data);
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'playember_tokenomics.json';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data: ' + error.message);
    }
}

const express = require('express');
const app = express();

app.use(express.static('public'));

app.listen(8000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:8000');
}); 