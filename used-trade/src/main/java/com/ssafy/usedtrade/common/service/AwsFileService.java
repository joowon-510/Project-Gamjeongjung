package com.ssafy.usedtrade.common.service;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.ssafy.usedtrade.domain.item.dto.ImageUploadRequest;
import com.ssafy.usedtrade.domain.item.entity.ItemImage;
import com.ssafy.usedtrade.domain.item.entity.SalesItem;
import com.ssafy.usedtrade.domain.item.repository.ItemImageRepository;
import com.ssafy.usedtrade.domain.item.repository.ItemSalesRepository;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AwsFileService {
    private final AmazonS3Client amazonS3Client;
    private final ItemSalesRepository itemSalesRepository;
    private final ItemImageRepository itemImageRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public boolean savePhoto(
            List<MultipartFile> multipartFileList,
            ImageUploadRequest imageUploadRequest,
            Integer memberId
    ) throws IOException {
        SalesItem salesItem = itemSalesRepository.findById(imageUploadRequest.itemId())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시물이 존재하지 않습니다."));

        // 생성한 멤버가 올리는 지 check
        if (salesItem.getUserId() != memberId) {
            return false;
        }

        List<ItemImage> itemImageList = new ArrayList<>();

        for (int idx = 0; idx < multipartFileList.size(); idx++) {
            File uploadFile = convert(multipartFileList.get(idx))  // 파일 변환할 수 없으면 에러
                    .orElseThrow(() -> new IllegalArgumentException("error: MultipartFile -> File convert fail"));
            String uploadUrl =
                    upload(uploadFile, imageUploadRequest.itemId(), idx + 1);

            if (!uploadUrl.isBlank()) {
                itemImageList.add(ItemImage.builder()
                        .salesItem(salesItem)
                        .imageName(uploadUrl)
                        .build());
            }
        }

        return !itemImageRepository.saveAll(itemImageList).isEmpty();
    }

    // S3로 파일 업로드하기
    private String upload(File uploadFile, Integer itemId, int idx) {
        String fileName = itemId + "/" + UUID.randomUUID() + idx;   // S3에 저장된 파일 이름
        String uploadImageUrl = putS3(uploadFile, fileName); // s3로 업로드
        removeNewFile(uploadFile);
        return uploadImageUrl;
    }

    // S3로 업로드
    private String putS3(File uploadFile, String fileName) {
        amazonS3Client.putObject(new PutObjectRequest(bucket, fileName, uploadFile).withCannedAcl(
                CannedAccessControlList.PublicRead));
        return amazonS3Client.getUrl(bucket, fileName).toString();
    }

    // 로컬에 저장된 이미지 지우기
    private void removeNewFile(File targetFile) {
        if (targetFile.delete()) {
            log.info("File delete success");
            return;
        }
        log.info("File delete fail");
    }

    // 로컬에 파일 업로드 하기
    private Optional<File> convert(MultipartFile file) throws IOException {
        File convertFile =
                new File(System.getProperty("user.home") + "/" + file.getOriginalFilename());
        if (convertFile.createNewFile()) { // 바로 위에서 지정한 경로에 File이 생성됨 (경로가 잘못되었다면 생성 불가능)
            try (FileOutputStream fos = new FileOutputStream(
                    convertFile)) { // FileOutputStream 데이터를 파일에 바이트 스트림으로 저장하기 위함
                fos.write(file.getBytes());
            }
            return Optional.of(convertFile);
        }
        return Optional.empty();
    }

    public void createDir(String bucketName, String folderName) {
        amazonS3Client.putObject(bucketName, folderName + "/", new ByteArrayInputStream(new byte[0]),
                new ObjectMetadata());
    }
}