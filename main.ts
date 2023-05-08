import { App, Editor, MarkdownView,Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { InsertLinkModal } from './modal';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		console.log('loading plugin');
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Hello from Techfall and VS Code!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Techfalls Status');

		// Techfall's first event subscription
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("Tech Print File Path 👈")
						.setIcon("document")
						.onClick(async () => {
							new Notice(file.path);
						});
				});
			})
		);
		// Techfall's second event subscription
		this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor, view) => {
			menu.addItem((item) => {
				item
					.setTitle("Tech Print File Path 👈")
					.setIcon("document")
					.onClick(async () => {
						new Notice(file.path);
					});
			})
		}));

		const ribbonIconE2 = this.addRibbonIcon("dice", "Open menu", (event) => {
			const menu = new Menu(this.app);
	  
			menu.addItem((item) =>
			  item
				.setTitle("Copy")
				.setIcon("documents")
				.onClick(() => {
				  new Notice("Copied");
				})
			);
	  
			menu.addItem((item) =>
			  item
				.setTitle("Paste")
				.setIcon("paste")
				.onClick(() => {
				  new Notice("Pasted");
				})
			);
	  
			menu.showAtMouseEvent(event);
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This is Techfall's first custom command from a custom plugin
		this.addCommand({
			id: 'log-message-to-console',
			name: 'Log console message.',
			callback: () => {
				console.log("First console log from custom command. Great job!");
			}
		});
		// This is Techfall's second custom command for a custom plugin
		this.addCommand({
			id: "insert-link",
			name: "Insert link",
			editorCallback: (editor: Editor) => {
				const selectedText = editor.getSelection();

				const onSubmit = (text: string, url: string) => {
					editor.replaceSelection('[${text}](${url})');
				};

				new InsertLinkModal(this.app, selectedText, onSubmit).open();
			};
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "Techfall's First Heading" });
		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		const book = containerEl.createEl("div");
		book.createEl("div", { text: "How To Take Smart Notes"});
		book.createEl("small", { text: "Sonke Ahrens"});
		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
