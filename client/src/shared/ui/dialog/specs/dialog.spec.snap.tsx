import { render } from '@testing-library/react';

import Dialog from 'src/shared/ui/dialog/dialog';

describe('Dialog', () => {
  it('matches snapshot when open', () => {
    const { baseElement } = render(
      <Dialog open={true} onClose={(): void => undefined}>
        <div>Dialog content</div>
      </Dialog>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot when closed', () => {
    const { baseElement } = render(
      <Dialog open={false} onClose={(): void => undefined}>
        <div>Dialog content</div>
      </Dialog>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot with disableAnimation', () => {
    const { baseElement } = render(
      <Dialog open={true} onClose={(): void => undefined} disableAnimation={true}>
        <div>Dialog content</div>
      </Dialog>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot with custom backdropColor', () => {
    const { baseElement } = render(
      <Dialog open={true} onClose={(): void => undefined} backdropColor="#0256b0">
        <div>Dialog content</div>
      </Dialog>,
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('matches snapshot with ariaLabel', () => {
    const { baseElement } = render(
      <Dialog open={true} onClose={(): void => undefined} ariaLabel="Test dialog">
        <div>Dialog content</div>
      </Dialog>,
    );
    expect(baseElement).toMatchSnapshot();
  });
});
