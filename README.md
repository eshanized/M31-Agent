# M31-Agents: AI Coding Assistant

M31-Agents is an advanced AI coding assistant that helps developers by providing real-time code completion, documentation, and coding assistance directly in Visual Studio Code.

## Features

- **Real-time Code Completion**: Get AI-assisted code suggestions as you type.
- **Code Generation**: Generate code based on your description.
- **Code Explanation**: Select any code snippet and get an explanation of what it does.
- **Commit Message Generation**: Automatically generate meaningful commit messages based on your changes.
- **Add Logging**: Intelligently add logging statements to your code with one click.
- **Multiple AI Models**: Choose between different AI models based on your needs.
- **Chat Interface**: Ask questions about your code and get immediate answers.

## Installation

1. Launch VS Code Quick Open (Ctrl+P)
2. Paste the following command:
   ```
   ext install m31-team.m31-agents
   ```
3. Press Enter to install

## Usage

### Code Completion
Type code as normal and M31-Agents will provide real-time suggestions.

### Generate Code
1. Press `Ctrl+Shift+P` to open the command palette
2. Type "M31-Agents: Generate Code"
3. Enter a description of the code you want to generate

### Explain Code
1. Select a piece of code in your editor
2. Right-click and select "M31-Agents: Explain Code" from the context menu
3. View the explanation in a notification

### Generate Commit Message
1. Make changes to your code
2. Press `Ctrl+Shift+P` to open the command palette
3. Type "M31-Agents: Generate Commit Message"
4. The commit message will be copied to your clipboard

### Add Logging
1. Select a piece of code in your editor
2. Press `Ctrl+Shift+P` to open the command palette
3. Type "M31-Agents: Add Logging"
4. Your code will be updated with appropriate logging statements

### Chat with AI Assistant
1. Click on the M31-Agents icon in the activity bar
2. Type your question in the text box and press Enter

## Configuration

You can configure M31-Agents through VS Code's settings:

- `m31-agents.apiKey`: Your API key for the M31-Agents service
- `m31-agents.model`: Select AI model (standard, advanced, expert)
- `m31-agents.autoComplete`: Enable/disable automatic code completion

## Requirements

- Visual Studio Code version 1.60.0 or higher

## Privacy and Data

M31-Agents values your privacy. The extension processes your code locally and only sends minimal data to our servers for AI processing. We do not store your code or use it for training our models.

## License

This extension is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, feature requests, or bug reports, please file an issue on our [GitHub repository](https://github.com/m31-team/m31-agents).

---

**M31-Agents - Your AI coding partner** 