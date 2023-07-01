import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { SlArrowUp, SlArrowDown } from "react-icons/sl";
// style
import "../styles/FormDropdown.scss";

interface DropdownProps {
  showArrow: boolean;
  className: string;
  title: any;
  children: any;
}

const FormDropdown = forwardRef(
  ({ showArrow, className, title, children }: DropdownProps, ref) => {
    const [isDropOpen, setIsDropOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleList = () => {
      setIsDropOpen(!isDropOpen);
    };

    useImperativeHandle(ref, () => {
      return {
        toggleList: toggleList,
      };
    });

    const renderArrow = () => {
      if (isDropOpen) {
        return <SlArrowUp className="dd-button-icon" />;
      } else {
        return <SlArrowDown className="dd-button-icon" />;
      }
    };

    useEffect(() => {
      if (!showArrow) {
        const handleOutsideClick = ({ target }: MouseEvent) => {
          if (
            dropdownRef.current &&
            !(dropdownRef.current as HTMLElement).contains(target as Node)
          ) {
            setIsDropOpen(false);
          }
        };

        if (isDropOpen) {
          document.addEventListener("mousedown", handleOutsideClick);
        }

        return () => {
          document.removeEventListener("mousedown", handleOutsideClick);
        };
      }
    }, [isDropOpen]);

    return (
      <div className={className || "dd-wrapper"} ref={dropdownRef}>
        <div className="dd-button" onClick={toggleList}>
          <div className="dd-button-text">{title}</div>
          {showArrow && renderArrow()}
        </div>
        {showArrow && isDropOpen && children}
        {!showArrow && isDropOpen && children}
      </div>
    );
  }
);

interface DropdownItemProps {
  onClick: () => void;
  children: any;
}

const FormDropdownItem = ({ onClick, children }: DropdownItemProps) => {
  return <div onClick={onClick}>{children}</div>;
};

export { FormDropdown, FormDropdownItem };
