import { Entity, Enum, OneToMany, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "../../../common/entities/base.entity.js";
import { FollowerRange } from "../enums/follower-range.enum.js";
import { InfluencerSocialMedia } from "./influencer-social-media.entity.js";
import { Collection } from "@mikro-orm/core";
import { ApprovalStatus } from "../../../common/enums/approval-status.enum.js";

@Entity()
export class Influencer extends BaseEntity {
    @Property({ type: "varchar", length: 150 })
    name: string;

    @Property({ type: "varchar", length: 100, unique: true })
    instagram: string;

    @Property({ type: "varchar", length: 20 })
    phone: string;

    @Property({ type: "varchar", length: 600 })
    reason: string;

    @Property({ type: "varchar", length: 30 })
    niche: string;

    @Property({ type: "varchar", length: 255 })
    videoUrl: string;

    @Property({ type: "varchar", length: 255, nullable: true })
    videoId: string | null;

    @Property({ type: "char", length: 2 })
    state: string;

    @Property({ type: "varchar", length: 150 })
    city: string;

    @Enum({ items: () => ApprovalStatus, nativeEnumName: "ApprovalStatus", default: ApprovalStatus.PENDING })
    approvalStatus: ApprovalStatus;

    @Enum({ items: () => FollowerRange, nativeEnumName: "FollowerRange" })
    followerRange: FollowerRange;

    @OneToMany(() => InfluencerSocialMedia, sm => sm.influencer)
    socialMedias = new Collection<InfluencerSocialMedia>(this);

    @Property({ nullable: true, type: "timestamptz" })
    deletedAt: Date | null;
}
