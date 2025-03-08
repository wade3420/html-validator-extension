# HTML Validator Extension

This project is a Chrome extension that validates HTML content of the active tab and categorizes validation messages into errors, warnings, and informational messages.

## Features

- Fetches HTML content from the active tab.
- Validates HTML and displays categorized messages.
- Provides a summary of total errors, warnings, and informational messages.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/wade3420/html-validator-extension
   cd html-validator-extension
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Build the project:

   ```bash
   yarn run build
   ```

4. Load the extension in Chrome:

   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" in the top right corner.
   - Click "Load unpacked" and select the `dist` directory from this project.

## Usage

1. Click the extension icon in the Chrome toolbar.
2. Click the "검사" button to validate the HTML of the current active tab.
3. View the validation results categorized as errors, warnings, and informational messages.

## Development

To start the development server, run:

```bash
yarn dev
```

This will watch for changes and automatically rebuild the project.

## Testing

To run the unit tests, use:

```bash
yarn test
```

To run tests with coverage, use:

```bash
yarn test:coverage
```

## Linting

To lint the project, run:

```bash
yarn lint
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push to your fork.
4. Create a pull request with a description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact [your-email@example.com](mailto:your-email@example.com).
