import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ value, onChange, options, placeholder = "선택", className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    const dropdownRef = useRef(null);

    // 외부 클릭 감지하여 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // value prop이 변경되면 selectedValue 업데이트
    useEffect(() => {
        setSelectedValue(value || '');
    }, [value]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue) => {
        setSelectedValue(optionValue);
        setIsOpen(false);
        if (onChange) {
            // 네이티브 select와 동일한 형태의 이벤트 객체 생성
            onChange({
                target: {
                    value: optionValue
                }
            });
        }
    };

    // 선택된 값의 라벨 찾기
    const getDisplayValue = () => {
        if (!selectedValue) return placeholder;
        const selected = options.find(opt => opt.value === selectedValue);
        return selected ? selected.label : placeholder;
    };

    return (
        <div
            className={`custom-select ${isOpen ? 'open' : ''} ${className}`}
            ref={dropdownRef}
        >
            <div
                className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
                onClick={handleToggle}
            >
                <span className={selectedValue ? '' : 'placeholder'}>
                    {getDisplayValue()}
                </span>
                <span className={`arrow ${isOpen ? 'up' : 'down'}`}>▼</span>
            </div>

            {isOpen && (
                <div className="custom-select-options">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            className={`custom-select-option ${selectedValue === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
