package com.ssafy.usedtrade.common.controller;

import com.ssafy.usedtrade.domain.auth.entity.SecurityMemberDetails;

public class BaseController {

    protected Integer getUserId(SecurityMemberDetails memberDetails) {
        return memberDetails.getId();
    }
}
