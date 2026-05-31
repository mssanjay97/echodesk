from bs4 import BeautifulSoup

def extractText(htmlText: str) -> str:
    soup = BeautifulSoup(htmlText, "html.parser")

    for tag in soup(["script", "style", "noscript"]):
        tag.extract()

    return soup.get_text()