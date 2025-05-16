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
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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
            String uploadUrl =
                    upload(multipartFileList.get(idx), imageUploadRequest.itemId(), idx + 1);

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
    private String upload(MultipartFile multipartFile, Integer itemId, int idx) throws IOException {
        String fileName = itemId + "/" + UUID.randomUUID() + idx;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(multipartFile.getSize());
        metadata.setContentType(multipartFile.getContentType());

        amazonS3Client.putObject(
                new PutObjectRequest(bucket, fileName, multipartFile.getInputStream(), metadata)
                        .withCannedAcl(
                                CannedAccessControlList.PublicRead));
        return amazonS3Client.getUrl(bucket, fileName).toString();
    }
}