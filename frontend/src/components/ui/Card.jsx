import React from 'react';
import './Card.css';

const Card = ({
    children,
    variant = 'default',
    padding = 'md',
    hoverable = false,
    glassmorphic = false,
    className = '',
    onClick,
    ...props
}) => {
    const getCardClass = () => {
        const classes = ['ui-card'];
        classes.push(`ui-card--${variant}`);
        classes.push(`ui-card--padding-${padding}`);
        if (hoverable) classes.push('ui-card--hoverable');
        if (glassmorphic) classes.push('ui-card--glass');
        if (className) classes.push(className);
        return classes.join(' ');
    };

    return (
        <div
            className={getCardClass()}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

// Card subcomponents for better composition
Card.Header = ({ children, className = '', ...props }) => (
    <div className={`ui-card__header ${className}`} {...props}>
        {children}
    </div>
);

Card.Body = ({ children, className = '', ...props }) => (
    <div className={`ui-card__body ${className}`} {...props}>
        {children}
    </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
    <div className={`ui-card__footer ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
