import { ComponentProps } from 'react'
import styled, { css } from 'styled-components'

import { Dialog, mq } from '@ensdomains/thorin'

const Wrapper = styled.div<{ $fullWidth?: boolean }>(
  ({ theme, $fullWidth }) => css`
    border-top: 1px solid ${theme.colors.border};
    width: 100%;
    padding-top: ${theme.space['4']};

    ${$fullWidth &&
    css`
      width: calc(100% + 2 * ${theme.space['4']});
      margin: -${theme.space['4']} -${theme.space['4']} 0 -${theme.space['4']};
      padding: ${theme.space['4']} ${theme.space['4']} 0 ${theme.space['4']};
    `}

    ${mq.sm.min(css`
      ${$fullWidth &&
      css`
        width: calc(100% + 2 * ${theme.space['6']});
        margin: -${theme.space['6']} -${theme.space['6']} 0 -${theme.space['6']};
        padding: ${theme.space['4']} ${theme.space['4']} 0 ${theme.space['4']};
      `}
    `)}
  `,
)

type Props = ComponentProps<typeof Dialog.Footer> & { fullWidth?: boolean }

export const DialogFooterWithBorder = ({ fullWidth, ...props }: Props) => {
  return (
    <Wrapper $fullWidth={fullWidth}>
      <Dialog.Footer {...props} />
    </Wrapper>
  )
}
