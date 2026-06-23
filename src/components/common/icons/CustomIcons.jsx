import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomIcons = ({ iconName, css }) => {    
    return (
        <>
            <FontAwesomeIcon icon={iconName} className={css} />
        </>
    )
}

export default CustomIcons