# IMPORTANT: Restart Backend Server

## After CORS Configuration Changes

The CORS configuration has been updated. **You MUST restart the backend server** for changes to take effect.

## Steps to Restart:

1. **Stop the current server:**
   - Find the terminal/command prompt where the backend is running
   - Press `Ctrl+C` to stop it

2. **Start the server again:**
   ```bash
   cd backend
   python -m pyramid.scripts.pserve development.ini
   ```

3. **Verify it's running:**
   - You should see: `Starting server in PID XXXXX`
   - Server should be listening on `127.0.0.1:6543`

## What Changed:

- ✅ CORS tween now handles all origins correctly
- ✅ Preflight OPTIONS requests are handled
- ✅ CORS headers added to all responses (including errors)
- ✅ Server configured to listen on `127.0.0.1:6543`

## Testing:

After restart, try logging in again. The CORS errors should be resolved.

If you still see CORS errors after restarting:
1. Check that the server is actually running
2. Check browser console for the exact error
3. Verify the server is listening on the correct port (6543)
