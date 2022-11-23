import PropTypes from 'prop-types';

// This is the only component that has styling through CSS classes
const Notification = ({ message }) => {
  if (message === null) return null;

  return (
    <div className={`message ${message.isError ? 'error' : ''}`}>
      {message.content}
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    isError: PropTypes.bool,
  }),
};

export default Notification;
