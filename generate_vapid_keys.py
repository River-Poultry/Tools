#!/usr/bin/env python3
"""
Generate VAPID keys for push notifications
Run this script to generate VAPID keys for your push notification setup.
"""

from py_vapid import Vapid
from cryptography.hazmat.primitives import serialization
import base64

def generate_vapid_keys():
    """Generate VAPID keys for push notifications"""
    vapid = Vapid()
    vapid.generate_keys()
    
    # Get the PEM formatted keys
    private_key = vapid.private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    public_key = vapid.public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    print("VAPID Keys Generated Successfully!")
    print("=" * 50)
    print(f"Private Key: {private_key}")
    print(f"Public Key: {public_key}")
    print("=" * 50)
    print("\nAdd these to your .env file:")
    print(f"VAPID_PRIVATE_KEY={private_key}")
    print(f"VAPID_PUBLIC_KEY={public_key}")
    print(f"VAPID_ADMIN_EMAIL=admin@riverpoultry.com")
    print("\nAnd add the public key to your frontend .env file:")
    print(f"REACT_APP_VAPID_PUBLIC_KEY={public_key}")

if __name__ == "__main__":
    generate_vapid_keys()
