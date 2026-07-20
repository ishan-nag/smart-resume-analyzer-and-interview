"""Regex-based contact extractors for email, phone, LinkedIn, and GitHub from raw text."""

import re


def extract_email(text: str) -> str:
    """Extracts the first email address found in text, or empty string."""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    """Extracts the first phone number found in text, or empty string."""
    pattern = r'(\+?\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}'
    match = re.search(pattern, text)
    return match.group(0).strip() if match else ""


def extract_linkedin(text: str) -> str:
    """Extracts a LinkedIn profile URL from text, or empty string."""
    pattern = r'(https?://)?(www\.)?linkedin\.com/in/[a-zA-Z0-9\-_/]+'
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(0).strip() if match else ""


def extract_github(text: str) -> str:
    """Extracts a GitHub profile URL from text, or empty string."""
    pattern = r'(https?://)?(www\.)?github\.com/[a-zA-Z0-9\-_/]+'
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(0).strip() if match else ""
