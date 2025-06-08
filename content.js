function injectStyles() {
  if (document.getElementById('date-inserter-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'date-inserter-styles';
  styleElement.textContent = `
    #date-insert-toolbar-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      margin: 0 2px;
      color: #333;
      background-color: transparent;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }

    #date-insert-toolbar-button:hover {
      background-color: #f0f0f0;
    }
  `;
  document.head.appendChild(styleElement);
}

function addToolbarButton() {
  const toolbar = document.querySelector('.redactor-toolbar');
  if (!toolbar) {
    return;
  }

  if (document.getElementById('date-insert-toolbar-button')) {
    return;
  }

  const button = document.createElement('a');
  button.id = 'date-insert-toolbar-button';
  button.className = 're-button re-button-icon';
  button.href = '#';
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', 'Insert Date');
  button.setAttribute('tabindex', '-1');
  button.setAttribute('data-re-icon', 'true');

  const buttonText = document.createElement('span');
  buttonText.innerText = '📅'; // Calendar emoji as an icon
  button.appendChild(buttonText);

  const formatButton = toolbar.querySelector('.re-button.re-format');
  if (formatButton) {
    formatButton.parentNode.insertBefore(button, formatButton.nextSibling);
  } else {
    toolbar.appendChild(button);
  }

  button.addEventListener('click', (e) => {
    e.preventDefault(); 

    const editor = document.querySelector('.redactor-styles.redactor-in[contenteditable="true"]');
    if (!editor) { 
      return;
    }

    editor.focus();

    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const dateString = `${day}-${month}-${year}-S2`;

    const boldElement = document.createElement('strong');
    boldElement.textContent = dateString;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentNode = range.commonAncestorContainer;

      if (editor.contains(parentNode) || editor === parentNode) {
        let targetNode = parentNode;
        if (targetNode.nodeType === Node.TEXT_NODE) {
          targetNode = targetNode.parentNode;
        }
        while (targetNode && targetNode !== editor && targetNode.nodeName !== 'P') {
          targetNode = targetNode.parentNode;
        }

        if (targetNode && targetNode.nodeName === 'P') {
          range.deleteContents();
          range.insertNode(boldElement);
          range.setStartAfter(boldElement);
          range.setEndAfter(boldElement);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          insertAtEnd(editor, boldElement);
        }
      } else {
        insertAtEnd(editor, boldElement);
      }
    } else {
      insertAtEnd(editor, boldElement);
    }
  });
}

function insertAtEnd(editor, element) {
  const lastChild = editor.lastChild;
  if (lastChild && lastChild.nodeName === 'P') {
    lastChild.appendChild(element);
  } else {
    const newParagraph = document.createElement('p');
    newParagraph.appendChild(element);
    editor.appendChild(newParagraph);
  }

  const range = document.createRange();
  const selection = window.getSelection();
  range.setStartAfter(element);
  range.setEndAfter(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

function observeDOM() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = function(mutationsList, observer) {
    const toolbar = document.querySelector('.redactor-toolbar');
    if (toolbar && !document.getElementById('date-insert-toolbar-button')) {
      addToolbarButton();
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

injectStyles();
addToolbarButton();
observeDOM();
