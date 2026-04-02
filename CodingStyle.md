# Contributing Guidelines

Thank you for your interest in contributing to this project. Please read the following rules before submitting code, issues, or pull requests.

## Code Style Rules

### General Rules
- Initialize variables at the beginning of each program, function, or class where they are used.
- Do not place hard-coded values or sensitive data in the middle of the code.
- Keep lines under 120 columns whenever possible for readability, except when absolutely necessary.
- Write clear, maintainable, and consistent code.
- Follow the same style across the whole project.

### Documentation and Tests
- Provide documentation and unit tests for the code.
- For web APIs, prefer Swagger documentation instead of writing only inline API docs.
- For web development, use comments to identify the corresponding part of the site or feature.
- These rules may be relaxed for constrained devices such as Raspberry Pi or Arduino projects.

### Function Rules
- For functions longer than 20 lines, add comments to mark the start of each major logical block.
- Use comments to clarify important control structures such as `if`, `else`, `try`, `except`, and `finally` when needed.
- Keep functions focused on one task whenever possible.

## Example Style
```python
@app.post("/data")
def receive_data(user_data: UserCreate):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.mac_address == user_data.mac_address).first()

        if user:
            user.nb_room = user_data.nb_room or 0
            user.name = user_data.name or "Unknown"
        else:
            user = User(
                mac_address=user_data.mac_address,
                nb_room=user_data.nb_room or 0,
                name=user_data.name or "Unknown"
            )
            db.add(user)
        # if ... else

        db.commit()

        return {
            "success": True,
            "message": "Data received and saved successfully!",
            "user": user
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save data")
    finally:
        db.close()
    # try ... except ... finally
# receive_data(user_data: UserCreate)
```

## Pull Request Expectations
- Keep pull requests small and focused when possible.
- Explain what changed and why.
- Include tests or proof that the change works.
- Make sure code follows the style rules in this file.

## Reporting Issues
- Describe the problem clearly.
- Include steps to reproduce it.
- Add screenshots or logs when useful.
- Mention the expected behavior and the actual behavior.

## Notes
- These guidelines are intended to improve readability and maintainability.
- Exceptions can be made when the platform or device has strict space or hardware limitations.