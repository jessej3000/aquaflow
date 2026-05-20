from datetime import date, datetime
from typing import Optional

import strawberry


@strawberry.type
class Branch:
    id: int
    unit_id: str
    name: Optional[str]
    address: Optional[str]
    contact: Optional[str]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


@strawberry.type
class Customer:
    id: int
    branch_id: Optional[int]
    branch_name: Optional[str]
    code: str
    name: Optional[str]
    address: Optional[str]
    contact: Optional[str]
    geolocation: Optional[str]
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]



@strawberry.type
class Inventory:
    id: int
    branch_id: Optional[int]
    branch_name: Optional[str]
    code: str
    name: str
    description: Optional[str]
    supplier: Optional[str]
    quantity: int
    capacity: int
    unit_cost: float
    selling_price: float
    status: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


@strawberry.type
class Order:
    id: int
    branch_id: Optional[int]
    branch_name: Optional[str]
    order_number: str
    customer_id: Optional[int]
    customer_name: Optional[str]
    delivery_address: Optional[str]
    contact_number: Optional[str]
    order_type: str
    container_type: Optional[str]
    container_size: Optional[int]
    quantity: int
    borrowed_containers: int
    returned_containers: int
    unit_price: float
    subtotal: float
    discount: float
    delivery_fee: float
    total_amount: float
    amount_paid: float
    change_amount: float
    payment_method: Optional[str]
    payment_status: str
    delivery_date: Optional[date]
    delivery_time_slot: Optional[str]
    delivery_notes: Optional[str]
    delivered_at: Optional[datetime]
    order_status: str
    cancellation_reason: Optional[str]
    priority_flag: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


@strawberry.type
class ActiveOrder:
    order_number: str
    customer_name: Optional[str]
    order_status: str
    order_type: str
    total_amount: float


@strawberry.type
class InventoryCapacity:
    capacity: float
    demand: float


@strawberry.type
class DailySales:
    day1: float
    day2: float
    day3: float
    day4: float
    day5: float
    day6: float
    day7: float
