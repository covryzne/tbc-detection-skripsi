def login_user(username, password):
    # Simulasi akun
    users = {
        "dokter": {"password": "dokter123", "role": "dokter"},
        "pasien": {"password": "pasien123", "role": "pasien"}
    }

    user = users.get(username)
    if user and user["password"] == password:
        return user["role"]
    return None
