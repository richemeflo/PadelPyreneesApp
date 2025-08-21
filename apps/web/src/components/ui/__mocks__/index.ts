import React from 'react';

const components: any = new Proxy({}, {
  get: (_target, prop: string) => {
    if (prop === 'Input') return (props: any) => React.createElement('input', props);
    if (prop === 'Textarea') return (props: any) => React.createElement('textarea', props);
    if (prop === 'Button') return ({ children, ...props }: any) => React.createElement('button', props, children);
    return ({ children, ...props }: any) => React.createElement('div', props, children);
  }
});

export = components;
