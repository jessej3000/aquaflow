from abc import ABC, abstractmethod


class BaseEmailProvider(ABC):
    name: str
    limit: int
    reset_type: str  # 'monthly' or 'daily'

    @abstractmethod
    def send(self, to: str, subject: str, body: str, from_addr: str, from_name: str) -> None:
        """Attempt to send an email. Raises on any failure."""
