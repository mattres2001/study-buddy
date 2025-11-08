from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.settings import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
try:
payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
sub: str | None = payload.get("sub")
if sub is None:
raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
return sub
except JWTError:
raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
