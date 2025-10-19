# ...existing code...
from algopy import (
    Account,
    ARC4Contract,
    BoxRef,
    Bytes,
    Global,
    String,
    Txn,
    UInt64,
    log,
)
from algopy.arc4 import Address, Bool, DynamicBytes, Struct, UInt8, abimethod
from algopy.arc4 import String as ARC4String

MAX_INCIDENT_BYTES = UInt64(2048)  # safety cap; adjust if you add fields


class IncidentRecord(Struct):
    """Structure for storing incident records"""

    incident_id: ARC4String  # UUID for the incident
    wallet_address: Address  # Offending user's wallet
    timestamp: UInt64  # Unix timestamp
    content_hash: DynamicBytes  # SHA-256 hash of content
    severity_level: UInt8  # 1=low, 2=medium, 3=high
    category: ARC4String  # Category of violation
    policy_version: ARC4String  # Version of moderation policy
    action_taken: ARC4String  # Action taken (warned, blocked, etc.)


class SentinelModeration(ARC4Contract):
    """
    Sentinel Moderation Smart Contract
    Records malicious activity incidents on-chain for family safety monitoring
    """

    def __init__(self) -> None:
        self.total_incidents = UInt64(0)
        self.version = String("1.0.0")

    @abimethod(create="require")
    def create(self) -> None:
        """Initialize the contract"""
        self.total_incidents = UInt64(0)
        self.version = String("1.0.0")

    @abimethod()
    def record_incident(
        self,
        incident_id: String,
        wallet_address: Account,
        content_hash: Bytes,
        severity_level: UInt8,
        category: String,
        policy_version: String,
        action_taken: String,
    ) -> String:
        """
        Record a moderation incident on-chain
        Anyone can call this method
        """
        # Validate severity level (1-3)
        assert severity_level >= UInt8(1), "Severity too low"
        assert severity_level <= UInt8(3), "Severity too high"

        # Ensure unique incident ID
        inc_key = b"inc_" + incident_id.bytes
        inc_box = BoxRef(key=inc_key)
        existing = inc_box.get(default=Bytes(b""))
        assert existing == Bytes(b""), "Incident already recorded"

        # Build the struct
        incident = IncidentRecord(
            incident_id=ARC4String(incident_id),
            wallet_address=Address(wallet_address),
            timestamp=Global.latest_timestamp,
            content_hash=DynamicBytes(content_hash),
            severity_level=severity_level,
            category=ARC4String(category),
            policy_version=ARC4String(policy_version),
            action_taken=ARC4String(action_taken),
        )

        # Encode to bytes and size the box dynamically (with safety cap)
        incident_bytes = incident.bytes
        size = len(incident_bytes)
        assert size <= MAX_INCIDENT_BYTES, "Incident too large"

        inc_box.create(size=size)
        inc_box.put(incident_bytes)

        # Update counters and log
        self.total_incidents = self.total_incidents + UInt64(1)
        log(incident_id.bytes)
        log(content_hash)

        return String("Incident recorded: ") + incident_id

    @abimethod()
    def batch_record_incidents(
        self,
        incident_ids: DynamicBytes,
        severity_levels: DynamicBytes,
        content_hashes: DynamicBytes,
    ) -> UInt64:
        """
        Record multiple low-severity incidents in batch (placeholder).
        Returns number of incidents recorded.
        """
        # TODO: parse the packed arrays and call into record logic with proper box refs
        count = UInt64(0)
        return count

    @abimethod(readonly=True)
    def get_incident(self, incident_id: String) -> IncidentRecord:
        inc_key = b"inc_" + incident_id.bytes
        inc_box = BoxRef(key=inc_key)
        inc_data = inc_box.get(default=Bytes(b""))
        assert inc_data != Bytes(b""), "Incident not found"
        return IncidentRecord.from_bytes(inc_data)

    @abimethod(readonly=True)
    def verify_incident(self, incident_id: String, content_hash: Bytes) -> Bool:
        inc_key = b"inc_" + incident_id.bytes
        inc_box = BoxRef(key=inc_key)
        inc_data = inc_box.get(default=Bytes(b""))
        if inc_data == Bytes(b""):
            return Bool(False)
        incident = IncidentRecord.from_bytes(inc_data)
        return Bool(incident.content_hash.bytes == content_hash)


    @abimethod(readonly=True)
    def get_contract_info(self) -> tuple[String, UInt64]:
        return (
            self.version,
            self.total_incidents,
        )
