# Lulu LSP for Emacs

## Installation

### Using `lsp-mode`

Add to your `init.el` or `.emacs`:

```elisp
;; Install lsp-mode if not already
(use-package lsp-mode
  :ensure t
  :hook ((typescript-mode js-mode python-mode go-mode rust-mode) . lsp)
  :commands lsp)

;; Optional: Install lsp-ui for enhanced features
(use-package lsp-ui
  :ensure t
  :after lsp-mode
  :config
  (setq lsp-ui-sideline-enable t)
  (setq lsp-ui-doc-enable t))
```

### Lulu LSP Configuration

```elisp
;; Lulu LSP setup
(require 'lsp-mode)
(require 'jsonrpc)

(defcustom lulu-lsp-command '("bun" "src/server/lsp-standalone.ts")
  "Command to start Lulu LSP server."
  :type '(repeat string)
  :group 'lsp-lulu)

(lsp-register-client
 (make-lsp-client
  :new-connection (lsp-stdio-connection lulu-lsp-command)
  :major-modes '(typescript-mode js-mode js2-mode python-mode go-mode rust-mode)
  :server-id 'lulu-lsp
  :priority -1))

;; Key bindings for Lulu commands
(with-eval-after-load 'lsp-mode
  (define-key lsp-mode-map (kbd "C-c l a") #'lulu-lsp-ask)
  (define-key lsp-mode-map (kbd "C-c l e") #'lulu-lsp-explain)
  (define-key lsp-mode-map (kbd "C-c l f") #'lulu-lsp-fix)
  (define-key lsp-mode-map (kbd "C-c l r") #'lulu-lsp-refactor))
```

### Commands

| Key | Command | Description |
|-----|---------|-------------|
| `C-c l a` | `lulu-lsp-ask` | Ask Lulu about selection |
| `C-c l e` | `lulu-lsp-explain` | Explain selected code |
| `C-c l f` | `lulu-lsp-fix` | Fix issues in selection |
| `C-c l r` | `lulu-lsp-refactor` | Refactor selection |

### Helper Functions

```elisp
(defun lulu-lsp--get-selection ()
  "Get current selection or word at point."
  (if (use-region-p)
      (buffer-substring-no-properties (region-beginning) (region-end))
    (thing-at-point 'symbol)))

(defun lulu-lsp-ask ()
  "Ask Lulu about current selection."
  (interactive)
  (let ((text (lulu-lsp--get-selection)))
    (when text
      (message "Asking Lulu about: %s" (substring text 0 (min 50 (length text)))))))

(defun lulu-lsp-explain ()
  "Explain current selection."
  (interactive)
  (let ((text (lulu-lsp--get-selection)))
    (message "Explaining: %s" (substring text 0 (min 50 (length text))))))

(defun lulu-lsp-fix ()
  "Fix issues in current selection."
  (interactive)
  (let ((text (lulu-lsp--get-selection)))
    (message "Fixing: %s" (substring text 0 (min 50 (length text))))))

(defun lulu-lsp-refactor ()
  "Refactor current selection."
  (interactive)
  (let ((text (lulu-lsp--get-selection)))
    (message "Refactoring: %s" (substring text 0 (min 50 (length text))))))
```

### Using with `eglot`

If you prefer `eglot` over `lsp-mode`:

```elisp
;; eglot configuration
(use-package eglot
  :ensure t
  :config
  (add-to-list 'eglot-server-programs
               `(typescript-mode . ("bun" "src/server/lsp-standalone.ts"))
               '(js-mode . ("bun" "src/server/lsp-standalone.ts"))
               '(python-mode . ("bun" "src/server/lsp-standalone.ts"))))
```

### Troubleshooting

1. **Server won't start**: Ensure `bun` is in PATH
   ```elisp
   (setenv "PATH" (concat "/usr/local/bin:" (getenv "PATH")))
   ```

2. **Check server output**: `M-x lsp-workspace-show-output`

3. **Restart server**: `M-x lsp-workspace-restart`