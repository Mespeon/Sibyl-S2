# Sibyl-S2
#### A customizable survey form generator with sentiment analysis on respondent feedback. A thesis work in progress.
##### This repository is for the Chrome extension only.
##### This thesis is now almost complete, but it will be continuously updated in the future.
## Testing and Installation
#### Compatible with Google Chrome only! Cross-compatibility is in the works, though.
1. Clone or download this repository. It will be downloaded as a ZIP file.
2. Extract contents into a folder.
3. Open Google Chrome.
4. Click the sandwich dots on the top right then go to More tools > Extensions.
5. Enable Developer mode in Extensions.
6. Click on Load unpacked then navigate to the folder where the extension files are extracted.

The installation is successful if a Sibyl 1.0 extension is added to your installed extensions grid.

## Features
1. Form Builder powered by the jQuery Form Builder found here (https://formbuilder.online/)
> Form builder now allows you to download, view, and copy the generated form's XML/HTML code.
2. The Sibyl Endpoint, hosted at (https://pythonanywhere.com) | Repository (https://github.com/Mespeon/Sibyl-S2-Backend)
3. User registry
>  register only; sign in pipelined for deployment
4. Lexicon Match sentiment analysis
>  dead simple; could use some improvement
5. Naive Bayes classifier sentiment analysis
> slightly more complicated than lexicon match; could also use some improvement
6. Developer Options
>  To access: open popup \> Developer Options
7. Sentiment analysis tester
> Choose between lexicon match or classifier; these algorithms are under development and may not always be accurate
8. Sibyl Analysis Dashboard
> Includes the aggregated data sentiment analysis trigger
