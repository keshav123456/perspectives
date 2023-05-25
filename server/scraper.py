from gnews import GNews
import spacy
from spacy.lang.en import STOP_WORDS
from spacytextblob.spacytextblob import SpacyTextBlob
nlp = spacy.load("en_core_web_sm")
nlp.add_pipe("spacytextblob")
from string import punctuation
from newspaper import Article
import urllib

def resolve(url):
    return urllib.request.urlopen(url).geturl()

# -----------------
def getQuery(query):

    doc = nlp(query)
    result_long = []
    result_short = []
    pos_tags = ["PROPN", "ADJ", "NOUN"]
    for token in doc:
        if token.text in nlp.Defaults.stop_words or token.text in punctuation:
            continue
        else:
            if token.pos_ in pos_tags:
                result_short.append(token.text)
            result_long.append(token.text)
        
    query_short = " ".join(result_short)

    return query_short

# -----------------
def summarise(doc):

    # Function to calculate sentence importance scores
    def sentence_importance(sent):
        return sum(token.rank for token in sent if token.lower_ not in STOP_WORDS)

    # Calculate sentence importance scores
    sentences = list(doc.sents)
    scores = [sentence_importance(sent) for sent in sentences]

    # Sort sentences based on scores and get top 3
    top_sentences = [sent.text for _, sent in sorted(zip(scores, sentences), reverse=True)][:4]

    return top_sentences

# -----------------
def parse_results(query_results):

    final_results = []
    for res in query_results:
        try:
            url = resolve(res['url'])
            article = Article(url)
            article.download()
            article.parse()
            article.nlp()

            text = article.text
            doc = nlp(text)
            polarity = doc._.blob.polarity
            subjectivity = doc._.blob.subjectivity
            summary = article.summary

            if "Sign up" in summary or "subscribe" in summary:
                summary = "Behind paywall"

            final_results.append(
                {'title': article.title,
                'url': url,
                'polarity': polarity,
                'subjectivity': subjectivity,
                'summary': summary,
                'publisher': res['publisher']['title'],
                'date': res['published date']}
            )

        except:
            print("Some error occured")

    return final_results


def scrape_google(query):

    # nlp to create query by keeping key words and dropping prepositions
    query = getQuery(query)

    # then scrape news websites
    google_news = GNews(max_results=7, country="GB")
    query_results = google_news.get_news(query)
    
    # get more details, polarity and subjectivity and summaries via nlp
    parsed_results = parse_results(query_results)

    # lots of extensions possible, better search, regular google search??

    print(parsed_results)
    return parsed_results