(function () {
  function normalize(s) {
    return (s || '').toLowerCase().trim();
  }

  function getRoot() {
    return document.querySelector('[data-prompt-root]');
  }

  function getOutputEl(root) {
    return root.querySelector('[data-prompt-output]');
  }

  function getTemplate(root) {
    var el = root.querySelector('[data-prompt-template]');
    return el ? el.textContent : '';
  }

  function collectVars(root) {
    var map = {};
    root.querySelectorAll('[data-prompt-var]').forEach(function (input) {
      var key = input.getAttribute('data-prompt-var');
      if (!key) return;
      map[key] = input;
    });
    return map;
  }

  function activeLang(root) {
    var active = root.querySelector('[data-prompt-lang].is-active');
    return active ? active.getAttribute('data-prompt-lang') : '';
  }

  function langSnippet(root, lang) {
    if (!lang) return '';
    var node = root.querySelector('[data-lang-snippet="' + lang + '"]');
    return node ? node.textContent.trim() : '';
  }

  function renderPrompt(root) {
    var template = getTemplate(root);
    var out = getOutputEl(root);
    if (!template || !out) return;

    var text = template;
    var vars = collectVars(root);
    Object.keys(vars).forEach(function (key) {
      var input = vars[key];
      var val = input.value || input.getAttribute('placeholder') || '{' + key + '}';
      text = text.split('{' + key + '}').join(val);
    });

    var lang = activeLang(root);
    var snippet = langSnippet(root, lang);
    if (snippet) {
      text = text.split('{language_context}').join(snippet);
    } else {
      text = text.split('{language_context}').join('');
    }

    out.textContent = text.replace(/\n{3,}/g, '\n\n').trim();
  }

  function initPlaceholders(root) {
    root.querySelectorAll('[data-prompt-var]').forEach(function (input) {
      input.addEventListener('input', function () {
        renderPrompt(root);
      });
      input.addEventListener('change', function () {
        renderPrompt(root);
      });
    });
  }

  function initLangTabs(root) {
    root.querySelectorAll('[data-prompt-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('[data-prompt-lang]').forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        renderPrompt(root);
      });
    });
  }

  function initCopy(root) {
    var copyBtn = root.querySelector('[data-prompt-copy]');
    if (!copyBtn) return;
    copyBtn.addEventListener('click', function () {
      var out = getOutputEl(root);
      if (!out) return;
      var text = out.textContent || '';
      if (!text) return;

      function done(ok) {
        var label = copyBtn.querySelector('.prompt-copy-label');
        if (!label) return;
        var original = label.getAttribute('data-default-label') || label.textContent;
        label.textContent = ok ? 'Copied' : 'Copy failed';
        window.setTimeout(function () {
          label.textContent = original;
        }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
          done(document.execCommand('copy'));
        } catch (e) {
          done(false);
        }
        document.body.removeChild(ta);
      }
    });
  }

  var root = getRoot();
  if (!root) return;

  initPlaceholders(root);
  initLangTabs(root);
  initCopy(root);
  renderPrompt(root);
})();
