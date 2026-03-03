/**
 * Interactive terminal emulator for the BOFH Excuses API landing page.
 * Commands: help, excuse, excuse <n>, excuse #<id>, status, clear
 */
(function () {
  'use strict';

  var API_BASE = window.location.origin;
  var output = document.getElementById('terminal-output');
  var input = document.getElementById('terminal-input');
  var body = document.getElementById('terminal-body');
  var history = [];
  var historyIndex = -1;

  if (!output || !input) return;

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var cmd = input.value.trim();
      if (cmd) {
        history.unshift(cmd);
        historyIndex = -1;
        processCommand(cmd);
      }
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        historyIndex++;
        input.value = history[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = history[historyIndex];
      } else {
        historyIndex = -1;
        input.value = '';
      }
    }
  });

  body.addEventListener('click', function () {
    input.focus();
  });

  function appendLine(html, className) {
    var div = document.createElement('div');
    div.className = 'terminal-line ' + (className || '');
    div.innerHTML = html;
    output.appendChild(div);
    scrollToBottom();
  }

  function appendCmd(cmd) {
    appendLine('<span class="terminal-prompt-echo">$ </span>' + escapeHtml(cmd), 'terminal-cmd');
  }

  function appendResult(text) {
    appendLine(text, 'terminal-result');
  }

  function appendError(text) {
    appendLine(text, 'terminal-error');
  }

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  function formatJson(obj) {
    var raw = JSON.stringify(obj, null, 2);
    return raw
      .replace(/"([^"]+)":/g, '<span class="t-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="t-str">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="t-num">$1</span>')
      .replace(/: null/g, ': <span class="t-null">null</span>');
  }

  async function processCommand(raw) {
    var parts = raw.toLowerCase().split(/\s+/);
    var cmd = parts[0];
    var arg = parts[1] || '';

    appendCmd(raw);

    switch (cmd) {
      case 'help':
        appendResult(
          '<span class="t-accent">Available commands:</span>\n' +
          '  excuse          Get a random excuse\n' +
          '  excuse &lt;n&gt;      Get n random excuses (1-50)\n' +
          '  excuse #&lt;id&gt;    Get excuse by ID (1-453)\n' +
          '  status          API health check\n' +
          '  clear           Clear terminal\n' +
          '  help            Show this message'
        );
        break;

      case 'excuse':
        await handleExcuse(arg);
        break;

      case 'status':
        await handleStatus();
        break;

      case 'clear':
        output.innerHTML = '';
        break;

      default:
        appendError('Unknown command: ' + escapeHtml(cmd) + '. Type <span class="t-accent">help</span> for commands.');
    }
  }

  async function handleExcuse(arg) {
    try {
      var url;
      if (!arg) {
        url = API_BASE + '/v1/excuses/random';
      } else if (arg.startsWith('#')) {
        var id = parseInt(arg.slice(1), 10);
        if (isNaN(id) || id < 1) {
          appendError('Invalid ID. Use excuse #1 through #453.');
          return;
        }
        url = API_BASE + '/v1/excuses/' + id;
      } else {
        var n = parseInt(arg, 10);
        if (isNaN(n) || n < 1 || n > 50) {
          appendError('Count must be between 1 and 50.');
          return;
        }
        url = API_BASE + '/v1/excuses/random?count=' + n;
      }

      var res = await fetch(url);
      var json = await res.json();

      if (json.error) {
        appendError(escapeHtml(json.error.message || json.error));
      } else {
        appendResult(formatJson(json));
      }
    } catch (err) {
      appendError('Request failed: ' + escapeHtml(err.message));
    }
  }

  async function handleStatus() {
    try {
      var res = await fetch(API_BASE + '/health');
      var json = await res.json();
      appendResult(formatJson(json));
    } catch (err) {
      appendError('Health check failed: ' + escapeHtml(err.message));
    }
  }

  window.bofhTerminal = { processCommand: processCommand };
})();
