function saveOptions() {
    var color = document.getElementById('bgcolor').value;
    localStorage.setItem('primaryGradientColor', color);
    console.log('Primary gradient color is set to ' + color);
}

function restoreOptions() {
    var color = localStorage.getItem('primaryGradientColor');
    document.getElementById('bgcolor').value = color || '#121212';
}

function resetOptions() {
    localStorage.removeItem('primaryGradientColor');

    document.getElementById('bgcolor').value = '#121212';
    console.log('Options have been reset to defaults.');
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('reset').addEventListener('click', resetOptions);
