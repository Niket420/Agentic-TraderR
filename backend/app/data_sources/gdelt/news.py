import logging

from app.data_sources.gdelt.client import GDELTClient

logger = logging.getLogger(__name__)

_INDIA_BUSINESS_QUERY = "(sourcecountry:India) (business OR earnings OR results OR IPO OR acquisition)"


def fetch_india_business_news(client: GDELTClient, timespan: str = "1d", maxrecords: int = 75) -> list[dict]:
    """Fetch recent Indian business/financial news articles from GDELT."""
    logger.info("Fetching GDELT India business news (timespan=%s)", timespan)
    articles = client.search_articles(_INDIA_BUSINESS_QUERY, maxrecords=maxrecords, timespan=timespan)
    logger.info("Fetched %d GDELT articles", len(articles))
    return articles


def fetch_news_for_company(client: GDELTClient, company_name: str, timespan: str = "3d") -> list[dict]:
    """Fetch recent news articles mentioning a specific company from GDELT."""
    query = f'"{company_name}" sourcecountry:India'
    logger.info("Fetching GDELT news for company=%r", company_name)
    articles = client.search_articles(query, timespan=timespan)
    logger.info("Fetched %d GDELT articles for company=%r", len(articles), company_name)
    return articles
