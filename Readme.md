# To Setup Sparticuz on your device locally

### Create `.env` file at the root directory

```properties
NODE_ENV = 'DEV'
CHROMIUM_PATH = 'c:\Program Files\Google\Chrome\Application\chrome.exeexe'
```

## On Windows

<br >

> Run the following command inside command prompt and replace the Chromium Path with the first output replacing all the forward slashes with backslashes

<br >

```bash
cd c:/ && dir chrome.exe /s/b
```

## On Mac/ Ubuntu

<br />

> Run the following command

<br />

```bash
where chromium
```

<br />

> If no results are found you have to install chromium using

<br />

```bash
brew install chromium
```
