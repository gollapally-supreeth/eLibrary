import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    onClick,
    type = 'button',
    className = '',
    ...props
}) => {
    const getButtonClass = () => {
        const classes = ['ui-button'];
        classes.push(`ui-button--${variant}`);
        classes.push(`ui-button--${size}`);
        if (fullWidth) classes.push('ui-button--full');
        if (loading) classes.push('ui-button--loading');
        if (disabled) classes.push('ui-button--disabled');
        if (className) classes.push(className);
        return classes.join(' ');
    };

    return (
        <button
            type={type}
            className={getButtonClass()}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="ui-button__spinner"></span>
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <span className="ui-button__icon ui-button__icon--left">{icon}</span>
                    )}
                    <span className="ui-button__text">{children}</span>
                    {icon && iconPosition === 'right' && (
                        <span className="ui-button__icon ui-button__icon--right">{icon}</span>
                    )}
                </>
            )}
        </button>
    );
};

export default Button;
