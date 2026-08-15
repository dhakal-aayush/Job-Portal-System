from sklearn.feature_extraction.text import TfidfVectorizer


def build_tfidf_vectorizer(documents: list[str]) -> tuple[TfidfVectorizer, "scipy.sparse.csr_matrix"]:
    """
    Fits a single TF-IDF vectorizer across the full corpus (e.g. all job
    descriptions + the candidate resume) so that resulting vectors share
    the same vocabulary and are directly comparable via cosine similarity.

    Returns the fitted vectorizer and the document-term matrix.
    """
    vectorizer = TfidfVectorizer(
        stop_words="english",
        lowercase=True,
        ngram_range=(1, 2),
        min_df=1,
        max_features=5000,
    )
    matrix = vectorizer.fit_transform(documents)
    return vectorizer, matrix


def vectorize_query(vectorizer: TfidfVectorizer, text: str):
    """Transform a single piece of text using an already-fitted vectorizer."""
    return vectorizer.transform([text])
