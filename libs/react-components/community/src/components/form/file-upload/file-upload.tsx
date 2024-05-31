import cn from 'classnames';
import React from 'react';

import { ILabelContext, useLabels } from '../../../providers/label-provider';
import Button from '../../button/button';
import { Card, CardContent } from '../../card';
import CloseButton from '../../close-button/close-button';
import Ellipsis from '../../ellipsis/ellipsis';
import { Col, Row } from '../../grid';
import Spinner from '../../spinner/spinner';
import Text from '../../typography/text/text';
import FormHelper, { FormHelperProps } from '../form-helper/form-helper';
import FormLabel, { FormLabelProps } from '../form-label/form-label';
import styles from './file-upload.module.scss';

export interface FileUploadFile extends Partial<File> {
  id?: string;
  /**
   * Is the file currently loading. Used when files are uploaded immediately
   */
  isLoading?: boolean;
}

export type FileRejectionType = 'size' | 'extension';

export interface RejectedFile {
  type: FileRejectionType;
  file: File;
}

export interface FileUploadProps extends FormLabelProps {
  /**
   * Additional classes.
   */
  className?: string;
  /**
   * Field name
   */
  name: string;
  /**
   * FileUpload helper
   */
  helper?: FormHelperProps;
  /**
   * The accept attribute value is a string that defines the file types the file input should accept
   * For example '.pdf,.jpg'
   */
  accept?: string;
  /**
   * When the multiple Boolean attribute is true, the file input allows the user to select more than one file.
   */
  multiple?: boolean;
  /**
   * onChange handler
   */
  onChange?: (files: FileUploadFile[]) => void;
  /**
   * defaultValue
   */
  defaultFiles?: FileUploadFile[];
  /**
   * onDelete handler
   */
  onDelete?: (file: FileUploadFile) => void;
  /**
   * Value of input to control input value from outside of component.
   * Do not use with defaultValue
   */
  files?: FileUploadFile[];
  /**
   * Is the fileUpload read-only
   */
  readOnly?: boolean;
  /**
   * If fileUpload is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Size limit in megabytes
   */
  maxSize?: number;
}

const getDefaultHelpers = (
  { accept, maxSize }: Partial<FileUploadProps>,
  getLabel: ILabelContext['getLabel']
): FormHelperProps | undefined => {
  if (!accept && !maxSize) return;
  const text = [
    accept && `${getLabel('file-upload.accept')} ${accept.replaceAll(',', ', ')}`,
    maxSize && `${getLabel('file-upload.max-size')} ${maxSize}MB`,
  ]
    .filter(Boolean)
    .join('. ');
  return text.length ? { text } : undefined;
};

const getUploadErrorHelperText = (rejectedFiles: RejectedFile[], getLabel: ILabelContext['getLabel']): string => {
  const textMap = rejectedFiles.reduce(
    (acc, { type, file }) => {
      acc[type].push(file.name);
      return acc;
    },
    { extension: [] as string[], size: [] as string[] }
  );

  // Get labels based on rejection type
  return Object.entries(textMap)
    .filter(([_, names]) => names.length)
    .map(([type, names]) => {
      const joinedNames = names.map((name) => `'${name}'`).join(', ');
      const label = getLabel(`file-upload.${type as FileRejectionType}-rejected`);
      if (typeof label === 'string') {
        return label;
      }
      return label(joinedNames);
    })
    .join('. ');
};

export const FileUpload = (props: FileUploadProps): JSX.Element => {
  const { getLabel } = useLabels();
  const {
    id,
    name,
    accept,
    multiple,
    onChange,
    className,
    defaultFiles,
    onDelete,
    files,
    readOnly,
    disabled = false,
    maxSize,
    helper = getDefaultHelpers({ accept, maxSize }, getLabel),
    ...rest
  } = props;
  const helperId = helper ? helper?.id ?? `${id}-helper` : undefined;

  const [hovered, setHovered] = React.useState(false);
  const [innerFiles, setInnerFiles] = React.useState<FileUploadFile[]>(defaultFiles || []);
  const [uploadErrorHelper, setUploadErrorHelper] = React.useState<FormHelperProps | undefined>();

  const fileUploadBEM = cn(styles['file-upload'], { [styles['file-upload-disabled']]: disabled });

  const validFileType = (file: File) => {
    if (!accept) {
      return true;
    }

    const fileTypes = accept?.replace(/,/g, '').split('.') || [];
    // Todo: Handle error handling

    const fileType = file.name.split('.').pop()?.toLowerCase();
    return !!fileType && fileTypes.includes(fileType);
  };

  const getFiles = React.useMemo(() => {
    return !!files && !!onChange ? files : innerFiles;
  }, [files, innerFiles, onChange]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const rejectedFiles: RejectedFile[] = [];
      const uploadedFiles = [...Array.from(e.target.files)]
        .filter((file) => {
          if (validFileType(file)) return true;

          rejectedFiles.push({ type: 'extension', file });
          return false;
        })
        .filter((file) => {
          if (!maxSize || file.size <= maxSize * 1024 ** 2) return true;

          rejectedFiles.push({ type: 'size', file });
          return false;
        });
      const newFiles = [...getFiles, ...uploadedFiles];

      if (typeof files === 'undefined') {
        setInnerFiles(newFiles);
      }

      onChange?.(newFiles);
      if (rejectedFiles.length) {
        setUploadErrorHelper({ type: 'error', text: getUploadErrorHelperText(rejectedFiles, getLabel) });
      } else {
        setUploadErrorHelper(undefined);
      }
    }
  };

  const onFileRemove = (file: FileUploadFile): void => {
    const newFiles = [...getFiles].filter((f) => f !== file);

    if (onDelete) {
      onDelete(file);
    }

    if (typeof files === 'undefined') {
      setInnerFiles(newFiles);
    }

    onChange?.(newFiles);
  };

  const getFileElement = (file: FileUploadFile, index: number) => {
    return (
      <li key={index}>
        <Card borderless={true}>
          <CardContent padding={0.5} background="bg-subtle">
            <Row justifyContent="between" alignItems="center" wrap="nowrap" gutter={file.isLoading ? 2 : 1}>
              <Col>
                <Ellipsis lineClamp={1}>
                  <Text modifiers="break-all">{file.name}</Text>
                </Ellipsis>
              </Col>
              {!readOnly && !disabled && (
                <Col width="auto">
                  {file.isLoading ? (
                    <Spinner />
                  ) : (
                    <CloseButton onClick={() => onFileRemove(file)}>{getLabel('remove')}</CloseButton>
                  )}
                </Col>
              )}
            </Row>
          </CardContent>
        </Card>
      </li>
    );
  };

  const showFiles = () => {
    return (
      <ul className={styles['file-upload__items']}>{getFiles.map((file, index) => getFileElement(file, index))}</ul>
    );
  };

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={styles['file-upload__label-wrapper']}
      >
        <FormLabel id={id} {...rest} renderWithoutLabel={readOnly} className={styles['file-upload__label']} />
      </div>
      {readOnly ? (
        showFiles()
      ) : (
        <Card padding={0.5} background={disabled ? 'bg-disabled' : undefined} className={styles['file-upload__card']}>
          <CardContent>
            <Row gutterY={2}>
              <Col>{showFiles()}</Col>
              <Col xs={12} md="auto" align="center">
                <div className={fileUploadBEM}>
                  <input
                    id={id}
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={onFileChange}
                    multiple={multiple}
                    disabled={disabled}
                  />
                  <Button
                    visualType="link"
                    iconLeft="file_upload"
                    aria-describedby={helperId}
                    isActive={hovered}
                    disabled={disabled}
                    onClick={() => document.getElementById(id)?.click()}
                  >
                    {getLabel('file-upload.add')}
                  </Button>
                </div>
              </Col>
            </Row>
          </CardContent>
        </Card>
      )}
      {(uploadErrorHelper || helper) && (
        <FormHelper {...((uploadErrorHelper || helper) as FormHelperProps)} id={helperId} />
      )}
    </div>
  );
};

export default FileUpload;
