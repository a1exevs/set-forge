import type { Meta } from '@storybook/react';
import React, { FC, useRef, useState } from 'react';

import { buildDesktopStoryObj, buildMobileStoryObj, buildTabletStoryObj } from 'storybook-dir/helpers';

import Dialog from 'src/shared/ui/dialog/dialog';

const storyTitle = 'Shared/Dialog';

const meta = {
  title: storyTitle,
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;

const DialogWithButton: React.FC<{ backdropColor?: string }> = ({ backdropColor = '#000000' }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f2f2f2' }}>
      <h1 style={{ color: '#212f79', marginBottom: '1rem' }}>Dialog Interactive Example</h1>
      <p style={{ color: '#212f79', marginBottom: '1.5rem' }}>
        Click the button below to open the dialog. You can close it by pressing ESC, clicking outside, or clicking the
        close button inside.
      </p>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#0256b0',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '500',
        }}
      >
        Open Dialog
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdropColor={backdropColor}
        ariaLabel="Interactive dialog example"
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '300px',
            maxWidth: '500px',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', color: '#212f79' }}>Dialog Title</h2>
          <p style={{ margin: '0 0 1.5rem 0', color: '#212f79' }}>
            This is an interactive dialog with overlay. You can close it by:
          </p>
          <ul style={{ color: '#212f79', marginBottom: '1.5rem' }}>
            <li>Pressing ESC key</li>
            <li>Clicking outside the dialog</li>
            <li>Clicking the button below</li>
          </ul>
          <button
            onClick={() => setOpen(false)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: '#0256b0',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '500',
            }}
          >
            Close Dialog
          </button>
        </div>
      </Dialog>
    </div>
  );
};

const exampleContent = (
  <div
    style={{
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      minWidth: '300px',
      maxWidth: '500px',
    }}
  >
    <h2 style={{ margin: '0 0 1rem 0', color: '#212f79' }}>Dialog Title</h2>
    <p style={{ margin: '0 0 1.5rem 0', color: '#212f79' }}>
      This is a basic dialog with overlay. Use the &quot;open&quot; control in the Storybook controls panel to show or
      hide the dialog.
    </p>
  </div>
);

export const Desktop = buildDesktopStoryObj({
  args: {
    open: true,
    onClose: (): void => undefined,
    children: exampleContent,
    backdropColor: '#000000',
    disableAnimation: true,
    ariaLabel: 'Example dialog',
  },
});

export const Tablet = buildTabletStoryObj({
  args: {
    open: true,
    onClose: (): void => undefined,
    children: exampleContent,
    backdropColor: '#000000',
    disableAnimation: true,
    ariaLabel: 'Example dialog',
  },
});

export const Mobile = buildMobileStoryObj({
  args: {
    open: true,
    onClose: (): void => undefined,
    children: exampleContent,
    backdropColor: '#000000',
    disableAnimation: true,
    ariaLabel: 'Example dialog',
  },
});

export const CustomBackdrop = buildDesktopStoryObj({
  args: {
    open: true,
    onClose: (): void => undefined,
    children: exampleContent,
    backdropColor: '#0256b0',
    disableAnimation: true,
    ariaLabel: 'Example dialog with custom backdrop',
  },
});

export const InteractiveDesktop = {
  ...buildDesktopStoryObj({}),
  render: () => <DialogWithButton />,
};

export const InteractiveTablet = {
  ...buildTabletStoryObj({}),
  render: () => <DialogWithButton />,
};

export const InteractiveMobile = {
  ...buildMobileStoryObj({}),
  render: () => <DialogWithButton />,
};

export const InteractiveCustomBackdrop = {
  ...buildDesktopStoryObj({}),
  render: () => <DialogWithButton backdropColor="#0256b0" />,
};

const DialogWithMultipleFocusableElements: FC = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', agree: false });

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f2f2f2' }}>
      <h1 style={{ color: '#212f79', marginBottom: '1rem' }}>Focus Trap Test with Multiple Elements</h1>
      <p style={{ color: '#212f79', marginBottom: '1.5rem' }}>
        This dialog contains multiple focusable elements (inputs, buttons, links, checkbox). Test that Tab cycles
        through all elements and returns to the first one. Test Shift+Tab goes backwards.
      </p>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#0256b0',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '500',
        }}
      >
        Open Dialog with Form
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdropColor="#000000"
        ariaLabel="Form dialog for focus trap testing"
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '500px',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', color: '#212f79' }}>Contact Form</h2>
          <p style={{ margin: '0 0 1.5rem 0', color: '#212f79', fontSize: '14px' }}>
            Test focus trap: Tab should cycle through all elements below and return to first input.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="name-input" style={{ display: 'block', marginBottom: '0.5rem', color: '#212f79' }}>
              Name:
            </label>
            <input
              id="name-input"
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                setFormData({ ...formData, name: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #8b9fb3b2',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="Enter your name"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email-input" style={{ display: 'block', marginBottom: '0.5rem', color: '#212f79' }}>
              Email:
            </label>
            <input
              id="email-input"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #8b9fb3b2',
                borderRadius: '4px',
                fontSize: '14px',
              }}
              placeholder="Enter your email"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: '#212f79', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.agree}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                  setFormData({ ...formData, agree: e.target.checked })
                }
                style={{ marginRight: '8px' }}
              />
              I agree to the terms and conditions
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <a
              href="#"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>): void => {
                e.preventDefault();
                alert('Terms and conditions link clicked');
              }}
              style={{ color: '#0256b0', textDecoration: 'underline', fontSize: '14px' }}
            >
              Read terms and conditions
            </a>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
            <button
              onClick={(): void => {
                setOpen(false);
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#0256b0',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              Submit
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                flex: 1,
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#8b9fb3b2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const FocusTrapTest = {
  ...buildDesktopStoryObj({}),
  render: () => <DialogWithMultipleFocusableElements />,
};

const DialogWithInitialFocus: React.FC = () => {
  const [open, setOpen] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', backgroundColor: '#f2f2f2' }}>
      <h1 style={{ color: '#212f79', marginBottom: '1rem' }}>Initial Focus Test</h1>
      <p style={{ color: '#212f79', marginBottom: '1.5rem' }}>
        This dialog uses <code>initialFocus</code> to focus the &quot;Delete&quot; button immediately when opened,
        instead of the first element (Cancel button).
      </p>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#0256b0',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '500',
        }}
      >
        Open Delete Confirmation
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        backdropColor="#000000"
        initialFocus={deleteButtonRef}
        ariaLabel="Delete confirmation dialog"
      >
        <div
          style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '400px',
            maxWidth: '500px',
          }}
        >
          <h2 style={{ margin: '0 0 1rem 0', color: '#212f79' }}>⚠️ Confirm Delete</h2>
          <p style={{ margin: '0 0 1.5rem 0', color: '#212f79' }}>
            Are you sure you want to delete this item? This action cannot be undone.
          </p>
          <p style={{ margin: '0 0 1.5rem 0', color: '#8b9fb3b2', fontSize: '14px' }}>
            Notice: The <strong>Delete button is focused</strong> when dialog opens (using initialFocus), not the Cancel
            button.
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem' }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                flex: 1,
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#8b9fb3b2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              ref={deleteButtonRef}
              onClick={(): void => {
                setOpen(false);
              }}
              style={{
                flex: 1,
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '500',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const InitialFocus = {
  ...buildDesktopStoryObj({}),
  render: () => <DialogWithInitialFocus />,
};
