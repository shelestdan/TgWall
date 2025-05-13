import hashlib
import hmac
import json
import os
from urllib.parse import unquote, parse_qs

# TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN") # Removed module-level variable

def validate_init_data(init_data_str: str, bot_token: str) -> dict | None:
    """
    Validates the initData string received from Telegram Mini App.

    Args:
        init_data_str: The raw initData string.
        bot_token: The Telegram bot token (should be passed from the caller after loading from env).

    Returns:
        A dictionary containing user data if validation is successful, otherwise None.
    """
    if not bot_token:
        # This print is for debugging, consider proper logging or raising an error
        print("Error: Bot token not provided to validate_init_data function.") 
        return None

    try:
        parsed_data = dict(parse_qs(init_data_str))
    except Exception as e:
        print(f"Error parsing initData query string: {e}")
        return None

    if "hash" not in parsed_data or not parsed_data["hash"]:
        print("Error: 'hash' not found or is empty in initData")
        return None

    received_hash = parsed_data.pop("hash")[0]

    data_check_arr = []
    for key, value_list in sorted(parsed_data.items()):
        if value_list:
            data_check_arr.append(f"{key}={value_list[0]}")
        else:
            data_check_arr.append(f"{key}=") 
            
    data_check_string = "\n".join(data_check_arr)

    secret_key = hmac.new("WebAppData".encode(), bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if calculated_hash == received_hash:
        if "user" in parsed_data and parsed_data["user"]:
            try:
                user_data_str = unquote(parsed_data["user"][0])
                user_data = json.loads(user_data_str)
                
                if "auth_date" in parsed_data and parsed_data["auth_date"] and "auth_date" not in user_data:
                    user_data["auth_date"] = int(parsed_data["auth_date"][0])
                elif "auth_date" in user_data:
                     user_data["auth_date"] = int(user_data["auth_date"])

                if "id" not in user_data:
                    print("Error: 'id' not found in user data within initData")
                    return None
                user_data["id"] = str(user_data["id"]) 

                return user_data
            except json.JSONDecodeError as e:
                print(f"Error decoding user JSON from initData: {e}")
                return None
            except KeyError as e:
                print(f"Error: Missing expected key in user data: {e}")
                return None
            except Exception as e:
                print(f"Error processing user data from initData: {e}")
                return None
        else:
            print("Error: 'user' data not found or empty in parsed_data after hash validation")
            return None
    else:
        print("Error: initData validation failed. Hashes do not match.")
        return None

if __name__ == '__main__':
    print("To test validate_init_data, provide a real initData string and ensure TELEGRAM_BOT_TOKEN is set in the calling environment and passed to the function.")
    # Example:
    # current_bot_token = os.getenv("TELEGRAM_BOT_TOKEN_FOR_TEST")
    # if current_bot_token:
    #     mock_init_data = "user=...&auth_date=...&hash=..." # Replace with real, URL-encoded initData
    #     validated_user = validate_init_data(mock_init_data, current_bot_token)
    #     if validated_user:
    #         print("Validation successful:", validated_user)
    #     else:
    #         print("Validation failed.")
    # else:
    #     print("Please set TELEGRAM_BOT_TOKEN_FOR_TEST environment variable for testing.")

