import React, {  useRef, useState } from 'react';
import type { DraggerProps } from 'antd/lib/upload/Dragger';
import type { UploadFile } from 'antd/lib/upload/interface';
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { idsToString } from '@/utils/async';
import PopImg from '@/components/Pop/PopImg';
import PopVideo from '@/components/Pop/PopVideo';
import styles from './index.less';

const { Dragger } = Upload;

export type MyUploadProps = Omit<DraggerProps, 'onChange'> & {
  onChange?: (ids: string) => any;
};

const _recordUploading = new Set();

const MyUpload: React.FC<MyUploadProps> = (props) => {
  const { onChange, ...restProps } = props;
  // const { setIsLoading } = useModel('addForm');
  const [previewFile, setPreviewFile] = useState<UploadFile>();
  /* 上传没有结束，关掉了组件 */
  const fileListUidRef = useRef<Set<string>>(new Set());

  /* loading关闭 */
  // useEffect(() => {
  //   return () => {
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //     fileListUidRef.current.forEach((uid) => _recordUploading.delete(uid));
  //     _recordUploading.size || setIsLoading(false);
  //   };
  // }, [setIsLoading]);

  // handle
  const changeHandle: DraggerProps['onChange'] = (info) => {
    const { status, uid } = info.file;
    if (status === 'uploading') {
      _recordUploading.add(uid);
      fileListUidRef.current.add(uid);
      // setIsLoading(true);
    } else {
      _recordUploading.delete(uid);
      fileListUidRef.current.delete(uid);
      // _recordUploading.size || setIsLoading(false);
      const links = idsToString(info.fileList.map((item) => item.response?.data?.link));
      onChange && onChange(links);
    }
  };
  const previewVisibleChange = (visible: boolean) => {
    visible || setPreviewFile(undefined);
  };
  
  return (
    <>
      <Dragger
        name="file"
        withCredentials
        listType="picture"
        showUploadList
        multiple
        onPreview={(v) => setPreviewFile(v)}
        //   maxCount={1}
        // action={FileURL.put}
        {...restProps}
        className={`${styles.dragger} ${props.className || ''}`}
        onChange={changeHandle}
      >
        <InboxOutlined className={styles.icon} />
        <p className={styles.p}>可点击可拖动</p>
      </Dragger>
      <PopImg
        src={previewFile?.response?.data?.link || previewFile?.thumbUrl}
        fallback={previewFile?.thumbUrl}
        width={0}
        preview={{
          visible: !!previewFile && _isImg(previewFile),
          onVisibleChange: previewVisibleChange,
        }}
      />
      {previewFile?.response?.data?.link && _isVideo(previewFile) ? (
        <PopVideo src={previewFile.response.data.link} onClose={() => setPreviewFile(undefined)} />
      ) : null}
    </>
  );
};

export default React.memo<React.FC<MyUploadProps>>(MyUpload);

const _isVideo = (file: UploadFile) => file.type.includes('video');
const _isImg = (file: UploadFile) => file.type.includes('image');
