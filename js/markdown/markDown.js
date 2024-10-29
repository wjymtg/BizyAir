import EasyMDE from './easyMarked.js'

export default class MarkDown {
    constructor(options) {
        if (!options || !options.containerId) {
            throw new Error('containerId is required');
        }
        
        this.options = options;
        this.isPreview = options.isPreview;
        this.containerId = options.containerId;
        this.content = options.content;
        
        this.createContainer();
        this.loadStyle();
        this.init();
    }

    createContainer() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`can't find container element with id ${this.containerId}`);
        }

        const existingEditor = container.querySelector(`#${this.containerId}-editor`);
        if (existingEditor) {
            throw new Error(`Editor already exists in container with id ${this.containerId}`);
        }

        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.transition = 'all 0.2s';
        
        const textarea = document.createElement('textarea');
        textarea.id = `${this.containerId}-editor`;
        if(this.content) {
            textarea.value = this.content;
        }
        
        wrapper.appendChild(textarea);
        container.appendChild(wrapper);
        
        this.wrapper = wrapper;
        this.textarea = textarea;
        this.originalDomId = textarea.id;
    }

    loadStyle(){
        const existingLink = document.querySelector('link[href*="easymarked.mini.css"]');
        if (existingLink) return;
        
        try {
            const cssPath = new URL('./easymarked.mini.css', import.meta.url).href;
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = cssPath;
            document.head.appendChild(linkElement);
        } catch (error) {
            console.error('load style error:', error);
        }
    }

    init() {
        if (this.isPreview) {
            this.preview(this.content);
        } else {
            this.editor();
        }
    }

    getCommonConfig() {
        return {
            element: this.textarea,
            spellChecker: false,
            height: "100%",
            tabSize: 4,
            status: false
        };
    }

    setFullscreen(isFullscreen) {
        if(isFullscreen) {
            const body = document.querySelector('body');
            body.appendChild(this.wrapper);
            this.wrapper.style.position = 'fixed';
            this.wrapper.style.left = '0';
            this.wrapper.style.top = '0';
            this.wrapper.style.width = '100vw';
            this.wrapper.style.height = '100vh';
            this.wrapper.style.zIndex = '99999';
            this.wrapper.style.background = '#fff';
        } else {
            const container = document.getElementById(this.containerId);
            container.appendChild(this.wrapper);
            this.wrapper.style.position = 'absolute';
            this.wrapper.style.left = '';
            this.wrapper.style.top = '';
            this.wrapper.style.width = '100%';
            this.wrapper.style.height = '100%';
            this.wrapper.style.zIndex = '';
            this.wrapper.style.background = '';
        }
    }

    editor() {
        // 建议将配置抽离到单独的配置文件中
        const config = {
            ...this.getCommonConfig(),
            autoDownloadFontAwesome: false,
            autofocus: true,
            autosave: {
                enabled: true,
                uniqueId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                    const r = window.crypto.getRandomValues(new Uint8Array(1))[0] % 16 | (c === 'x' ? 0 : 8);
                    return r.toString(16);
                }),
                delay: 1000,
            },
            uploadImage: true,
            toolbar: [
                "bold", "italic", "heading", "|", 
                "quote", "unordered-list", "ordered-list", "|", 
                "link", "code", "table", {
                    name: "upload-image",
                    action: function customFunction(editor) {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = () => {
                            const file = input.files[0];
                            if (file) {
                                config.imageUploadFunction(
                                    file,
                                    (url) => {
                                        const output = `![${file.name}](${url})`;
                                        editor.codemirror.replaceSelection(output);
                                    },
                                    (error) => {
                                        console.error('upload image file error:', error);
                                    }
                                );
                            }
                        };
                        input.click();
                    },
                    className: "fa fa-upload",
                    title: "upload image",
                }, "|", 
                "preview", "side-by-side", "fullscreen", "|", 
                "guide"
            ],
            onToggleFullScreen: (isFullscreen) => {
                this.setFullscreen(isFullscreen);
            },
            imageUploadFunction: (file, onSuccess, onError) => {
                try {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        onSuccess(e.target.result);
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    onError('upload image file error');
                }
            },
          
            events: {
                "fullscreenChange": (instance, isFullscreen) => {
                    this.setFullscreen(isFullscreen);
                },
                "paste": (instance, e) => {
                    if (e.clipboardData && e.clipboardData.items) {
                        for (let i = 0; i < e.clipboardData.items.length; i++) {
                            if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
                                const file = e.clipboardData.items[i].getAsFile();
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const output = `![Alt text](${e.target.result})`;
                                    instance.codemirror.replaceSelection(output);
                                };
                                reader.readAsDataURL(file);
                            }
                        }
                    }
                }
            }
        };
        
        new EasyMDE(config);
    }

    preview(content) {
        const config = {
            ...this.getCommonConfig(),
            autofocus: false,
            autosave: false,
            toolbar: false,
            sideBySideFullscreen: false,
            forceSync: true,
            status: false,
            initialValue: content,
        };
        
        const easyMDE = new EasyMDE(config);
        easyMDE.togglePreview();
    }
}