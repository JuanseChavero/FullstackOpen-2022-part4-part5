import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

const LoginForm = ({
  username,
  password,
  handleUsernameChange,
  handlePasswordChange,
  handleLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Container maxWidth="xs">
      <h2>Log in to application</h2>
      <form onSubmit={handleOnSubmit} id="login">
        {/* Username Input */}
        <TextField
          fullWidth
          id="username-input"
          label="Username"
          variant="outlined"
          name="username"
          type={'text'}
          value={username}
          onChange={handleUsernameChange}
        />

        <Box mt={2} />

        {/* Password input */}
        <TextField
          fullWidth
          id="password-input"
          label="Password"
          variant="outlined"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  color="primary"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box mt={2} />

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            id="login-button"
          >
            login
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default LoginForm;
