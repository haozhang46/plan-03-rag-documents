from app.auth.passwords import hash_password, verify_password


def test_hash_and_verify_roundtrip():
    hashed = hash_password("correct horse battery staple")
    assert hashed.startswith("pbkdf2_sha256$")
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong", hashed)
