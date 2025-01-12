/**
 * WordPress dependencies
 */
import { createContext } from '@wordpress/element';

/**
 * @typedef { import('react').ReactElement } ReactElement
 * @typedef { import('./tab').Tab } Tab
 * @typedef { (isSelected: boolean) => void } Callback
 * @typedef { {selectedTab: Tab } } TabbedInterface
 */

/**
 * @type { TabbedInterface }
 */
const defaultContext = {
	selectedTab: { id: '', className: '', label: <></> },
};

/**
 * @typedef { import('react').Context<TabbedInterface> } TabContext
 * @type { TabContext }
 */
const Context = createContext( defaultContext );

export default Context;
