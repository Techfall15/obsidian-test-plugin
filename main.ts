import { App, Editor, MarkdownView,Menu, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { InsertLinkModal } from './modal';
import { ExampleModal } from 'myfirstmodal';
import { isStringObject } from 'util/types';
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
			new Notice('Good evening from Techfall and VS Code!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Techfalls Status');

		
		// ---------------------------------------------------------------------------- Get Parent Folder Name
		this.addCommand({
			id: "get-parent-folder-name",
			name: "Get Parent Folder Name",
			callback: () => {
				const myFile = this.app.workspace.getActiveFile();
				const parentName = myFile?.parent?.name;
				const isParentRoot = myFile?.parent?.isRoot();
				if(parentName != undefined)
				{
					new Notice(parentName.toString());
				}
				console.log(isParentRoot);
			},
		});
		// ---------------------------------------------------------------------------- Log Console Message
		this.addCommand({
			id: 'log-message-to-console',
			name: 'Log console message.',
			callback: () => {
				console.log("First console log from custom command. Great job!");
			}
		});
		// ---------------------------------------------------------------------------- Create Note In Active Folder
		this.addCommand({
			id: "create-sub-note",
			name: "Create Sub Note",
			editorCallback: (editor: Editor) => {
				const selectedText = editor.getSelection();
				const currentFile = this.app.workspace.getActiveFile();
				const folderName = currentFile?.parent?.name;
				var newFilePath = "";
				if(folderName != undefined)
				{
					newFilePath = `${folderName}` + '/';
				}


				editor.replaceSelection(`[[${folderName}/${selectedText}|${selectedText}]]`);
			}
		});
		
		// ---------------------------------------------------------------------------- Insert Link
		this.addCommand({
			id: "insert-link",
			name: "Insert link",
			editorCallback: (editor: Editor) => {
				const selectedText = editor.getSelection();

				const onSubmit = (text: string, url: string) => {
					editor.replaceSelection(`[${text}](${url})`);
				};

				new InsertLinkModal(this.app, selectedText, onSubmit).open();
			}
		});
		// ---------------------------------------------------------------------------- Get Name Modal
		this.addCommand({
			id: "input-my-name",
			name: "Input my name.",
			callback: () => {
				new ExampleModal(this.app, (result) => {
					new Notice(`Hello, ${result}!`);
				}).open();
			},
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
