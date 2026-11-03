import { Entity, Enum, ManyToOne, Property, Unique } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "../../../common/entities/base.entity.js";
import { SocialMedia } from "../enums/social-media.enum.js";
import { Influencer } from "./influencer.entity.js";
import type { Rel } from "@mikro-orm/core";

@Entity()
@Unique({
    properties: ["socialMedia", "influencer"],
})
export class InfluencerSocialMedia extends BaseEntity {
    @Enum({ items: () => SocialMedia, nativeEnumName: "SocialMedia" })
    socialMedia: SocialMedia;

    @Property({ type: "varchar", length: 255 })
    link: string;

    @ManyToOne(() => Influencer, { deleteRule: "cascade" })
    influencer: Rel<Influencer>;
}
